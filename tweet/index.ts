'use strict';

import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { getTweetsModel, getUserTweetsModel, tweet } from './model';
import { TweetService } from './service';
import { tweets, userPro } from '../utility/interface';
import { arrayToString, getUserIdFromToken, stringToArray } from '../utility';
import { MAX_TWEET_LENGTH } from '../utility/constants';
import { errorHandler } from '../errors';
import { UserService } from 'user/service';

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

const plugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
    const tweetService: TweetService = fastify.tweetService;
    const userService: UserService = fastify.userService;
    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
    fastify.post('/', { schema: tweet }, (request, reply) => addTwitterHandler(request, reply, tweetService, userService));
    fastify.get('/', { schema: getUserTweetsModel }, getTwitterHandler);
    fastify.get('/:userIds', { schema: getTweetsModel }, getUserTweetsHandler);

    fastify.setErrorHandler(errorHandler);

    done();
};

Object.defineProperty(plugin, Symbol.for('plugin-meta'), {
    value: pluginMeta,
});

const addTwitterHandler = async (request: FastifyRequest, reply: FastifyReply, tweetService: TweetService, userService: UserService) => {
    const token = request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
        reply.code(401).send({ message: 'Invalid or expired token' });
        return
    }
    const { tweet, tags } = request.body as tweets
    const userId = getUserIdFromToken(token)
    if (!userId) {
        reply.code(401).send({ message: 'Invalid or expired token' });
        return;
    }
    if (tweet.length > MAX_TWEET_LENGTH) {
        reply.code(400).send({ message: 'Tweet exceeds maximum character limit' });
        return;
    } else if (tweet.length < 1) {
        reply.code(400).send({ message: 'You must something' });
    }

    const mentionedUsernames = stringToArray(tags).map(tag => tag.slice(1));
    const foundUsers = await userService.findUsersByUsername(mentionedUsernames) as {users: userPro[], usernames: string[]}
    await tweetService.addTweet(userId, tweet, arrayToString(foundUsers.usernames));
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
