import fastify from 'fastify';
import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize-typescript';
import userPlugin from './user';
import tweetPlugin from './tweet';
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
        userService: UserService;
        tweetService: TweetService;
        timelineService: TimelineService;
        followService: FollowService;
    }
}


async function connectToRedis() {
    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    server.decorate('redis', redis);
}

async function connectToDatabases() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.SQLITE_PATH || "./db/database.db",
        logging: false,
    });

    await sequelize.authenticate();

    server.decorate('sequelize', sequelize);
}

async function authenticator() {
    const jwtSecret = process.env.JWT_SECRET || "my-super-secret";
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
    }

    await server.register(fastifyJwt, {
        secret: jwtSecret,
        algorithms: ['RS256']
    } as FastifyJWTOptions);
}

export async function decorateFastifyInstance(): Promise<void> {
    await server.register(connectToRedis);

    const sequelize = server.sequelize;

    const User = sequelize.define('User', {
        username: DataTypes.STRING,
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        email: DataTypes.STRING,
        password: DataTypes.STRING,
    });

    const Tweet = sequelize.define('Tweet', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        content: DataTypes.STRING,
        userId: DataTypes.STRING,
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        tags: DataTypes.STRING
    });

    User.hasMany(Tweet, { foreignKey: 'userId' });
    Tweet.belongsTo(User, { foreignKey: 'userId' });

    await sequelize.sync();

    const userService = new UserService(sequelize);
    server.decorate('userService', userService);

    const tweetService = new TweetService(sequelize);
    server.decorate('tweetService', tweetService);

    const followService = new FollowService(server);
    server.decorate('followService', followService);

    const timelineService = new TimelineService(followService, tweetService);
    server.decorate('timelineService', timelineService);

    server.decorate('authPreHandler', async function auth(request: FastifyRequest, reply: FastifyReply) {
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
    .register(tweetPlugin, { prefix: '/api/tweet' })
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
