'use strict';
const model_1 = require("./model");
const pluginMeta = {
    decorators: {
        fastify: [
            'authPreHandler',
            'tweetService',
        ],
    },
};
const plugin = async (fastify, opts) => {
    //   fastify.addHook('preHandler', fastify.authPreHandler);
    fastify.post('/', { schema: model_1.tweet }, addTwitterHandler);
    fastify.get('/', { schema: model_1.getUserTweetsModel }, getTwitterHandler);
    fastify.get('/:userIds', { schema: model_1.getTweetsModel }, getUserTweetsHandler);
};
Object.defineProperty(plugin, Symbol.for('plugin-meta'), {
    value: pluginMeta,
});
const addTwitterHandler = async (req, reply) => {
    const request = req;
    const { text } = request.body;
    await request.tweetService.addTweet(request.user._id, text);
    reply.code(204);
};
const getTwitterHandler = (req, reply) => {
    const request = req;
    return request.tweetService.fetchTweets([request.user._id]);
};
const getUserTweetsHandler = (req, reply) => {
    const request = req;
    const userIds = request.params.userIds.split(',');
    return request.tweetService.fetchTweets(userIds);
};
module.exports = plugin;
