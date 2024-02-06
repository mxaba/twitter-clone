'use strict';

import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import fastifyPostgres from '@fastify/postgres';

const schema = {
    type: 'object',
    required: ['POSTGRES_URL', 'REDIS_URL', 'JWT_SECRET'],
    properties: {
        POSTGRES_URL: { type: 'string' },
        REDIS_URL: { type: 'string' },
        JWT_SECRET: { type: 'string' },
    },
    additionalProperties: false,
};

async function connectToDatabases(fastify: FastifyInstance) {
    fastify.register(fastifyPostgres, {
        connectionString: 'postgres://user:password@host:port/db',
    });
}

async function authenticator(fastify: FastifyInstance) {
    fastify.register(require('@fastify/jwt'), {
        secret: "my-super-secret",
        algorithms: ['RS256'],
    });
}


export default async function (fastify: FastifyInstance, opts: any) {
    fastify
        .register(require('fastify-env'), { schema, data: [opts] })
        .register(fp(connectToDatabases, opts))
        .register(fp(authenticator))
}
