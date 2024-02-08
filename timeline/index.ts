import { FastifyPluginCallback, FastifyRequest, FastifyReply, RouteHandlerMethod } from 'fastify';
import timelineSchema from './model';

interface CustomRequest extends FastifyRequest {
    user: {
        _id: string;
    };
    timelineService: any;
    jwt: any;
}

const plugin: FastifyPluginCallback = async (fastify, opts) => {
    fastify.get('/', { schema: timelineSchema }, getTimelineHandler);
};

(plugin as any)[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'authPreHandler',
            'timelineService',
        ]
    }
};

const getTimelineHandler: RouteHandlerMethod = async (req, reply) => {
    const request = req.body as CustomRequest;
    return request.timelineService.getTimeline(request.user._id);
}

export = plugin;
