'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const sequelize_typescript_1 = require("sequelize-typescript");
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
const schema = {
    type: 'object',
    required: ['POSTGRES_URL', 'REDIS_URL', 'JWT_SECRET'],
    properties: {
        POSTGRES_URL: { type: 'string' },
        REDIS_URL: { type: 'string' },
        JWT_SECRET: { type: 'string' }
    },
    additionalProperties: false
};
async function connectToDatabases(fastify) {
    const sequelize = new sequelize_typescript_1.Sequelize(fastify.config.POSTGRES_URL, {
        dialect: 'postgres',
        logging: false,
    });
    // Assign the sequelize instance to fastify
    fastify.decorate('sequelize', sequelize);
}
async function authenticator(fastify) {
    await fastify.register(require('fastify-jwt'), {
        secret: 'my-super-secret',
        algorithms: ['RS256']
    });
}
async function transformStringIntoObjectId(str) {
    return parseInt(str, 10);
}
async function decorateFastifyInstance(fastify) {
    const sequelize = fastify.sequelize;
    sequelize.addModels([User]);
    // Create tables if they do not exist
    await sequelize.sync({ force: false });
    const userService = new UserService( /* pass sequelize instance or model */);
    fastify.decorate('userService', userService);
    const tweetService = new TweetService( /* pass sequelize instance or model */);
    fastify.decorate('tweetService', tweetService);
    const followService = new FollowService(fastify.redis);
    fastify.decorate('followService', followService);
    const timelineService = new TimelineService(followService, tweetService);
    fastify.decorate('timelineService', timelineService);
    fastify.decorate('authPreHandler', async function auth(request, reply) {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.send(err);
        }
    });
    fastify.decorate('transformStringIntoObjectId', transformStringIntoObjectId);
}
async function default_1(fastify, opts) {
    await fastify
        .register(require('fastify-swagger'), swaggerOption)
        .register(require('fastify-env'), { schema, data: [opts] })
        .register((0, fastify_plugin_1.default)(connectToDatabases))
        .register((0, fastify_plugin_1.default)(authenticator))
        .register((0, fastify_plugin_1.default)(decorateFastifyInstance))
        .register(require('./user'), { prefix: '/api/user' })
        .register(require('./tweet'), { prefix: '/api/tweet' })
        .register(require('./follow'), { prefix: '/api/follow' })
        .register(require('./timeline'), { prefix: '/api/timeline' });
}
exports.default = default_1;
