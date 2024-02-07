import path from 'path';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize-typescript';
import userPlugin from './user';
import { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';


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
    POSTGRES_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    // Add other configuration properties if needed
}

declare module 'fastify' {
    interface FastifyInstance {
        config: Config;
        sequelize: Sequelize;
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
    required: ['POSTGRES_URL', 'REDIS_URL', 'JWT_SECRET'],
    properties: {
        POSTGRES_URL: { type: 'string' },
        REDIS_URL: { type: 'string' },
        JWT_SECRET: { type: 'string' }
    },
    additionalProperties: false
};


async function connectToDatabases(fastify: FastifyInstance) {
    const sequelize = new Sequelize(fastify.config.POSTGRES_URL, {
        dialect: 'postgres',
        logging: false,
    });

    // Assign the sequelize instance to fastify
    fastify.decorate('sequelize', sequelize);
}

async function authenticator(fastify: FastifyInstance) {
    await fastify.register(require('fastify-jwt'), {
        secret: 'my-super-secret',
        algorithms: ['RS256']
    });
}

async function decorateFastifyInstance(fastify: FastifyInstance): Promise<void> {
    fastify.register(fastifyJwt, {
        secret: 'your-secret-key'
    });
    const sequelize = fastify.sequelize;

    // Assuming User, TweetService, FollowService, and TimelineService are defined elsewhere
    sequelize.addModels([User]);

    // Create tables if they do not exist
    await sequelize.sync({ force: false });

    fastify.decorate('authPreHandler', async function auth(request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    // UserService, TweetService, FollowService, and TimelineService instantiation

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