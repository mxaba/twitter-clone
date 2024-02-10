import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize-typescript';
import userPlugin from './user';
import { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { UserService } from './user/service';
import { TweetService } from './tweet/service';
import { DataTypes } from 'sequelize';
import { Redis } from 'ioredis';
import FollowService from './follow/servers';
import TimelineService from './timeline/server';


const swaggerOption = {
    swagger: {
        info: {
            title: 'Test swagger',
            description: 'testing the fastify swagger api',
            version: '0.1.0'
        },
        host: 'localhost',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
};

interface Config {
    SQLITE_PATH: string;
    REDIS_URL: string;
    JWT_SECRET: string;
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
    required: ['SQLITE_PATH', 'REDIS_URL', 'JWT_SECRET'],
    properties: {
        SQLITE_PATH: { type: 'string' },
        REDIS_URL: { type: 'string' },
        JWT_SECRET: { type: 'string' }
    },
    additionalProperties: false
};

async function connectToRedis(fastify: FastifyInstance) {
    const redis = new Redis(fastify.config.REDIS_URL);
    fastify.decorate('redis', redis);
}

async function connectToDatabases(fastify: FastifyInstance) {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: fastify.config.SQLITE_PATH,
        logging: false,
    });

    await sequelize.authenticate();

    fastify.decorate('sequelize', sequelize);
}

async function authenticator(fastify: FastifyInstance) {
    await fastify.register(require('fastify-jwt'), {
        secret: fastify.config.JWT_SECRET,
        algorithms: ['RS256']
    });
}

async function decorateFastifyInstance(fastify: FastifyInstance): Promise<void> {

    await fastify.register(connectToRedis);

    fastify.register(fastifyJwt, {
        secret: fastify.config.JWT_SECRET
    });
    const sequelize = fastify.sequelize;

    const User = sequelize.define('User', {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
    });

    const Tweet = sequelize.define('Tweet', {
        content: DataTypes.STRING,
        userId: DataTypes.INTEGER,
    });

    User.hasMany(Tweet);
    Tweet.belongsTo(User);

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

export default async function (fastify: FastifyInstance, opts: any) {
    await fastify
        .register(require('fastify-swagger'), swaggerOption)
        .register(require('fastify-env'), { schema, data: [opts] })
        .register(fp(connectToDatabases))
        .register(fp(authenticator))
        .register(fp(decorateFastifyInstance))
        .register(userPlugin, { prefix: '/api/user' })
        .register(require('./tweet'), { prefix: '/api/tweet' })
        .register(require('./follow'), { prefix: '/api/follow' })
        .register(require('./timeline'), { prefix: '/api/timeline' })
}
