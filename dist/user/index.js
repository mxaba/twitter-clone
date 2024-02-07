"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
const errors_1 = require("../errors");
const errorHandler = (error, request, reply) => {
    const message = error.message;
    const statusCode = errors_1.errors[message] ? 412 : 500;
    reply.code(statusCode).send(error);
};
const loginHandler = async (request, reply) => {
    const req = request;
    const { username, password } = req.body;
    const { userService, jwt } = req;
    const user = await userService.login(username, password);
    return { jwt: jwt.sign(user) };
};
const registerHandler = async (request, reply) => {
    const req = request;
    const { username, password } = req.body;
    const userId = await req.userService.register(username, password);
    return { userId };
};
const meHandler = async (request, reply) => {
    const req = request;
    const userId = req.user._id;
    return req.userService.getProfile(userId);
};
const userHandler = async (request, reply) => {
    const req = request;
    return req.userService.getProfile(req.params.userId);
};
const searchHandler = async (request, reply) => {
    const req = request;
    const { search } = req.query;
    return req.userService.search(search);
};
const plugin = (fastify, options, done) => {
    // Unlogged APIs
    fastify.post('/login', { schema: models_1.login }, loginHandler);
    fastify.post('/register', { schema: models_1.registration }, registerHandler);
    // Logged APIs
    fastify.register(async function (fastify) {
        fastify.get('/me', meHandler);
        fastify.get('/:userId', { schema: models_1.getProfile }, userHandler);
        fastify.get('/search', { schema: models_1.search }, searchHandler);
    });
    fastify.setErrorHandler(errorHandler);
    done();
};
exports.default = plugin;
