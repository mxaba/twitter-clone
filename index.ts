import fastify from 'fastify';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize-typescript';
import userPlugin from './user';
import { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import { UserService } from './user/service';
import { TweetService } from './tweet/service';
import { DataTypes } from 'sequelize';
import { Redis } from 'ioredis';
import FollowService from './follow/servers';
import TimelineService from './timeline/server';

const server = fastify();

interface Config {
    SQLITE_PATH: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    PORT: string | number;
}

declare module 'fastify' {
    interface FastifyInstance {
        config: Config;
        sequelize: Sequelize;
        redis: Redis;
    }
}

interface Schema {
    type: 'object';
    required: string[];
    properties: {
        [key: string]: { type: string };
    };
    additionalProperties: boolean;
}

const schema: Schema = {
    type: 'object',
    required: ['SQLITE_PATH', 'REDIS_URL', 'JWT_SECRET', 'PORT'],
    properties: {
        SQLITE_PATH: { type: 'string' },
        REDIS_URL: { type: 'string' },
        JWT_SECRET: { type: 'string' },
        PORT: { type: 'string' }
    },
    additionalProperties: false
};

async function connectToRedis(fastify: FastifyInstance) {
    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    fastify.decorate('redis', redis);
}

async function connectToDatabases(fastify: FastifyInstance) {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.SQLITE_PATH || "./db/database.db",
        logging: false,
    });

    await sequelize.authenticate();

    fastify.decorate('sequelize', sequelize);
}

async function authenticator(fastify: FastifyInstance) {
    const jwtSecret = process.env.JWT_SECRET || "my-super-secret";
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
    }

    await fastify.register(fastifyJwt, {
        secret: jwtSecret,
        algorithms: ['RS256']
    } as FastifyJWTOptions); 
}

async function decorateFastifyInstance(fastify: FastifyInstance): Promise<void> {
    await fastify.register(connectToRedis);

    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || "my-super-secret"
    });
    const sequelize = fastify.sequelize;

    const User = sequelize.define('User', {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
    });
    
    const Tweet = sequelize.define('Tweet', {
        content: DataTypes.STRING,
    });
    
    User.hasMany(Tweet, { foreignKey: 'userId' });
    Tweet.belongsTo(User, { foreignKey: 'userId' }); 

    await sequelize.sync();

    const userService = new UserService(sequelize);
    fastify.decorate('userService', userService);

    const tweetService = new TweetService(sequelize);
    fastify.decorate('tweetService', tweetService);

    const followService = new FollowService(fastify);
    fastify.decorate('followService', followService);

    const timelineService = new TimelineService(followService, tweetService);
    fastify.decorate('timelineService', timelineService);

    fastify.decorate('authPreHandler', async function auth(request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
}


server
.register(fp(connectToDatabases))
.register(fp(authenticator))
.register(fp(decorateFastifyInstance))
.register(userPlugin, { prefix: '/api/user' })
.register(require('./tweet'), { prefix: '/api/tweet' })
.register(require('./follow'), { prefix: '/api/follow' })
.register(require('./timeline'), { prefix: '/api/timeline' });


server.listen({ port: 8080 }, (err, address) => {
    console.log(`Server listening at ${address}`)
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
