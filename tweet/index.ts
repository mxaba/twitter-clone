'use strict';

import { FastifyPluginCallback, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { getTweetsModel, getUserTweetsModel, tweet } from './model';
import { TweetService } from './service';

interface CustomRequest<Body = any, Params = any, Query = any> extends FastifyRequest {
    body: Body;
    params: Params;
    query: Query;
    user: {
        _id: string;
    };
    userIds: [string];
    tweetService: TweetService;
    jwt: any;
}

const pluginMeta = {
    decorators: {
        fastify: [
            'authPreHandler',
            'tweetService',
        ],
    },
};

const plugin: FastifyPluginCallback = async (fastify, opts) => {
    fastify.post('/', { schema: tweet }, addTwitterHandler);
    fastify.get('/', { schema: getUserTweetsModel }, getTwitterHandler);
    fastify.get('/:userIds', { schema: getTweetsModel }, getUserTweetsHandler);
};

Object.defineProperty(plugin, Symbol.for('plugin-meta'), {
    value: pluginMeta,
});

const addTwitterHandler: RouteHandlerMethod = async (req, reply) => {
    const request = req as CustomRequest;
    const { text, tags } = request.body; 
    await request.tweetService.addTweet(request.user._id, text, tags);
    reply.code(204);
};

const getTwitterHandler: RouteHandlerMethod = (req, reply) => {
    const request = req as CustomRequest;
    return request.tweetService.fetchTweets([request.user._id]);
};

const getUserTweetsHandler: RouteHandlerMethod = (req, reply) => {
    const request = req as CustomRequest;
    const userIds = request.params.userIds.split(',');
    return request.tweetService.fetchTweets(userIds);
};

export = plugin;
