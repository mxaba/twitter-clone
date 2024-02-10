import { FastifyPluginCallback, FastifyReply, RouteHandlerMethod } from 'fastify';
import { FastifyRequest } from 'fastify';
import FollowService from './servers';

interface CustomRequest<Body = any, Params = any> extends FastifyRequest {
    params: Params;
    body: Body;
    user: {
        _id: string;
    };
    followService: FollowService;
    jwt: any;
    userId: string;
}

const plugin: FastifyPluginCallback = async (fastify, opts) => {
    // fastify.addHook('preHandler', fastify.authPreHandler);

    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    fastify
        .post('/follow', { schema: { body: { type: 'object', required: ['userId'], properties: { userId: { type: 'string' } }, additionalProperties: false } } }, followHandler)
        .post('/unfollow', { schema: { body: { type: 'object', required: ['userId'], properties: { userId: { type: 'string' } }, additionalProperties: false } } }, unfollowHandler)
        .get('/following/me', getMyFollowingHandler)
        .get('/followers/me', getMyFollowersHandler)
        .get('/following/:userId', getUserFollowingHandler)
        .get('/followers/:userId', getUserFollowersHandler);
};

(plugin as any)[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'redis',
            'authPreHandler',
            'followService'
        ]
    }
};

const followHandler: RouteHandlerMethod = async (req, reply) => {
    const { userId, user, followService } = req.body as CustomRequest;
    await followService.follow(user._id, userId);
    reply.code(204);
}

const unfollowHandler: RouteHandlerMethod = async (req, reply) => {
    const { userId, user, followService } = req.body as CustomRequest;
    await followService.unfollow(user._id, userId);
    reply.code(204);
}

const getMyFollowingHandler: RouteHandlerMethod = async (req, reply) => {
    const { user, followService } = req.body as CustomRequest;
    return followService.getFollowing(user._id);
}

const getMyFollowersHandler: RouteHandlerMethod = async (req, reply) => {
    const { user, followService } = req.body as CustomRequest;
    return followService.getFollowers(user._id);
}

const getUserFollowingHandler: RouteHandlerMethod = async (req, reply) => {
    const { params, followService } = req.body as CustomRequest;
    return followService.getFollowing(params.userId);
}

const  getUserFollowersHandler: RouteHandlerMethod = async (req, reply) => {
    const { params, followService } = req.body as CustomRequest;
    return followService.getFollowers(params.userId);
}

export = plugin;
