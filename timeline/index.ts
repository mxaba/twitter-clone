import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import timelineSchema from './model';
import { getUserIdFromToken } from '../utility';
import TimelineService from './server';


const plugin: FastifyPluginCallback = async (fastify, opts) => {
    const timelineService: TimelineService = fastify.timelineService;
    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
    fastify.get('/', { schema: timelineSchema }, (request, reply) => getTimelineHandler(request, reply, timelineService));
    fastify.get('/feed', (request, reply) => getPublicFeedHandler(request, reply, timelineService));
};

(plugin as any)[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'authPreHandler',
            'timelineService',
        ]
    }
};

const getTimelineHandler = async (request: FastifyRequest, reply: FastifyReply, timelineService: TimelineService) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
        reply.code(401).send({ message: 'Invalid or expired token' });
        return
    }
    const userId = getUserIdFromToken(token);

    if (!userId) {
        reply.code(401).send({ message: 'Invalid or expired token' });
        return;
    }
    return timelineService.getTimeline(userId);
}

const getPublicFeedHandler = async (request: FastifyRequest, reply: FastifyReply, timelineService: TimelineService) => {
    return timelineService.getPublicFeed();
}

export = plugin;
