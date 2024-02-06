'use strict';

import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize-typescript';

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

async function transformStringIntoObjectId(str: string): Promise<number> {
    return parseInt(str, 10);
  }

async function decorateFastifyInstance(fastify: FastifyInstance): Promise<void> {
    const sequelize = fastify.sequelize;

    sequelize.addModels([User]);

    await sequelize.sync({ force: false }); 

    const userService = new UserService(/* pass sequelize instance or model */);
    fastify.decorate('userService', userService);

    

    fastify.decorate('authPreHandler', async function auth(request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    fastify.decorate('transformStringIntoObjectId', transformStringIntoObjectId);
}

export default async function (fastify: FastifyInstance, opts: any) {
    await fastify
        .register(require('fastify-swagger'), swaggerOption)
        .register(require('fastify-env'), { schema, data: [opts] })
        .register(fp(connectToDatabases))
        .register(fp(authenticator))
        .register(fp(decorateFastifyInstance))
        .register(require('./user'), { prefix: '/api/user' })
        .register(require('./tweet'), { prefix: '/api/tweet' })
        .register(require('./follow'), { prefix: '/api/follow' })
        .register(require('./timeline'), { prefix: '/api/timeline' })
}
