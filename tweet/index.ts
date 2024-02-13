'use strict';

import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { getUserTweetsModel, tweet } from './model';
import { TweetService } from './service';
import { tweets, userPro } from '../utility/interface';
import { arrayToString, extractTaggedUsers, getUserIdFromToken, stringToArray } from '../utility';
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
    fastify.get('/', { schema: getUserTweetsModel }, (request, reply) => getTwitterHandler(request, reply, tweetService));
    fastify.get('/:userIds', { schema: getUserTweetsModel }, (request, reply) => getUserTweetsHandler(request, reply, tweetService));

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
    const { tweet } = request.body as tweets
    const userId = getUserIdFromToken(token)
    if (!userId) {
        reply.code(401).send({ message: 'Invalid or expired token' });
        return;
    }
    if (tweet.length > MAX_TWEET_LENGTH) {
        reply.code(400).send({ message: 'Tweet exceeds maximum character limit' });
        return;
    } else if (tweet.length < 1) {
        reply.code(400).send({ message: 'You must tweet something' });
    }

    const mentionedUsernames = extractTaggedUsers(tweet).map(tag => tag.slice(1));
    const foundUsers = await userService.findUsersByUsername(mentionedUsernames) as {users: userPro[], notFoundUsers: string[], usernames: string[]}

    if (foundUsers.notFoundUsers.length > 0) {
        reply.code(400).send({ message: `Some of the tags users don not exists: ${arrayToString(foundUsers.notFoundUsers)}` });
        return;
    }
    await tweetService.addTweet(userId, tweet, arrayToString(mentionedUsernames));
    reply.code(204);
};

const getTwitterHandler = async (request: FastifyRequest, reply: FastifyReply, tweetService: TweetService) => {
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

    return tweetService.fetchTweets([userId]);
};

const getUserTweetsHandler = async (request: FastifyRequest, reply: FastifyReply, tweetService: TweetService) => {
    const { userIds } = request.params as { userIds: string };
    const users = userIds.split(',');
    
    try {
        const tweets = await tweetService.fetchTweets(users);
        return tweets;
    } catch (error) {
        console.error('Error fetching tweets:', error);
        reply.code(500).send({ message: 'Internal Server Error' });
    }
};

export = plugin;
