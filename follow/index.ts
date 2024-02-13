import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import FollowService from './servers';
import { getUserIdFromToken } from '../utility';

const getUserId = (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        reply.code(401).send({ message: 'Invalid or expired token' });
        return;
    }
    const userId = getUserIdFromToken(token);
    if (!userId) {
        reply.code(401).send({ message: 'Invalid or expired token' });
        return;
    }
    return userId
};

const plugin: FastifyPluginCallback = async (fastify, opts) => {
    const followService: FollowService = fastify.followService;

    fastify.post('/follow', (request, reply) => followHandler(request, reply, followService));
    fastify.post('/unfollow', (request, reply) => unfollowHandler(request, reply, followService));
    fastify.get('/following/me', (request, reply) => getMyFollowingHandler(request, reply, followService));
    fastify.get('/followers/me', (request, reply) => getMyFollowersHandler(request, reply, followService));
    fastify.get('/following/:userId', (request, reply) => getUserFollowingHandler(request, reply, followService));
    fastify.get('/followers/:userId', (request, reply) => getUserFollowersHandler(request, reply, followService));
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

const followHandler = async (request: FastifyRequest, reply: FastifyReply, followService: FollowService) => {
    const { userId } = request.body as { userId: string };
    const user = getUserId(request, reply)

    if (!user) {
        return
    }
    try {
        await followService.follow(user, userId);
        reply.code(204);
    } catch (error) {
        reply.send(error);
    }
};

const unfollowHandler = async (request: FastifyRequest, reply: FastifyReply, followService: FollowService) => {
    const { userId } = request.body as { userId: string };
    try {
        const user = getUserId(request, reply)

        if (!user) {
            return
        }
        await followService.unfollow(user, userId);
        reply.code(204);
    } catch (error) {
        reply.send(error);
    }
};

const getMyFollowingHandler = async (request: FastifyRequest, reply: FastifyReply, followService: FollowService) => {
    try {
        const user = getUserId(request, reply)

        if (!user) {
            return
        }
        return followService.getFollowing(user);
    } catch (error) {
        reply.send(error);
    }
};

const getMyFollowersHandler = async (request: FastifyRequest, reply: FastifyReply, followService: FollowService) => {
    const { userId } = request.params as { userId: string };
    try {
        return followService.getFollowers(userId);
    } catch (error) {
        reply.send(error);
    }
};

const getUserFollowingHandler = async (request: FastifyRequest, reply: FastifyReply, followService: FollowService) => {
    const { userId } = request.params as { userId: string };
    try {
        return followService.getFollowing(userId);
    } catch (error) {
        reply.send(error);
    }
};

const getUserFollowersHandler = async (request: FastifyRequest, reply: FastifyReply, followService: FollowService) => {
    const { userId } = request.params as { userId: string };
    try {
        return followService.getFollowers(userId);
    } catch (error) {
        reply.send(error);
    }
};

export = plugin;
