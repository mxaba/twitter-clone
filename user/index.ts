import { FastifyPluginCallback, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UserService } from './service';
import { getProfile, login, registration, search } from './models';
import { RouteHandlerMethod } from 'fastify';
import { errors } from '../errors';

interface CustomRequest<Body = any, Params = any, Query = any> extends FastifyRequest {
    body: Body;
    params: Params;
    query: Query;
    user: {
        _id: string;
    };
    userService: UserService;
    jwt: any;
}

const errorHandler = (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const message = error.message;
    const statusCode = errors[message as keyof typeof errors] ? 412 : 500;
    reply.code(statusCode).send(error);
};

const loginHandler: RouteHandlerMethod = async (request, reply) => {
    const req = request as CustomRequest;
    const { username, password } = req.body;
    const { userService, jwt } = req;

    const user = await userService.login(username, password);
    return { jwt: jwt.sign(user) };
};

const registerHandler: RouteHandlerMethod  = async (request, reply: FastifyReply) => {
    const req = request as CustomRequest;
    const { username, password } = req.body;
    const userId = await req.userService.register(username, password);
    return { userId };
};

const meHandler: RouteHandlerMethod  = async (request, reply: FastifyReply) => {
    const req = request as CustomRequest;
    const userId = req.user._id;
    return req.userService.getProfile(userId);
};

const userHandler: RouteHandlerMethod  = async (request, reply: FastifyReply) => {
    const req = request as CustomRequest;
    return req.userService.getProfile(req.params.userId);
};

const searchHandler: RouteHandlerMethod  = async (request, reply: FastifyReply) => {
    const req = request as CustomRequest;
    const { search } = req.query;
    return req.userService.search(search);
};

const plugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
    // Unlogged APIs
    fastify.post('/login', { schema: login }, loginHandler);
    fastify.post('/register', { schema: registration }, registerHandler);

    // Logged APIs
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        });
        fastify.get('/me', meHandler);
        fastify.get('/:userId', { schema: getProfile }, userHandler);
        fastify.get('/search', { schema: search }, searchHandler);
    });

    fastify.setErrorHandler(errorHandler);

    done();
};

export default plugin;
