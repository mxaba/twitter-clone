const tweet = {
    body: {
        type: 'object',
        required: [ 'text' ],
        properties: {
            text: { type: 'string' },
            tags: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
        additionalProperties: false,
    },
};

const getUserTweetsModel = {
    params: {
        type: 'object',
        required: ['userIds'],
        properties: {
            userIds: {
                type: 'string'
            },
        },
        additionalProperties: false,
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    text: { type: 'string' },
                    tags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
};

const getTweetsModel = {
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    text: { type: 'string' },
                    tags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
};

export { tweet, getUserTweetsModel, getTweetsModel };
