"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = __importDefault(require("./user"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const service_1 = require("./user/service");
const service_2 = require("./tweet/service");
const sequelize_1 = require("sequelize");
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
async function decorateFastifyInstance(fastify) {
    fastify.register(jwt_1.default, {
        secret: 'your-secret-key'
    });
    const sequelize = fastify.sequelize;
    const User = sequelize.define('User', {
        username: sequelize_1.DataTypes.STRING,
        email: sequelize_1.DataTypes.STRING,
        password: sequelize_1.DataTypes.STRING,
    });
    const Tweet = sequelize.define('Tweet', {
        content: sequelize_1.DataTypes.STRING,
        userId: sequelize_1.DataTypes.INTEGER,
    });
    // Define associations (relationships) between models
    User.hasMany(Tweet);
    Tweet.belongsTo(User);
    await sequelize.sync();
    const userService = new service_1.UserService(sequelize);
    fastify.decorate('userService', userService);
    const tweetService = new service_2.TweetService(sequelize);
    fastify.decorate('tweetService', tweetService);
    // Create tables if they do not exist
    await sequelize.sync({ force: false });
    fastify.decorate('authPreHandler', async function auth(request, reply) {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.send(err);
        }
    });
    //  TimelineService instantiation
}
async function default_1(fastify, opts) {
    await fastify
        .register(require('fastify-swagger'), swaggerOption)
        .register(require('fastify-env'), { schema, data: [opts] })
        .register((0, fastify_plugin_1.default)(connectToDatabases))
        .register((0, fastify_plugin_1.default)(authenticator))
        .register((0, fastify_plugin_1.default)(decorateFastifyInstance))
        .register(user_1.default, { prefix: '/api/user' })
        .register(require('./tweet'), { prefix: '/api/tweet' })
        .register(require('./follow'), { prefix: '/api/follow' })
        .register(require('./timeline'), { prefix: '/api/timeline' });
}
exports.default = default_1;
