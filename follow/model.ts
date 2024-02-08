interface FollowSchema {
    body: {
        type: 'object';
        required: ['userId'];
        properties: {
            userId: { type: 'string' };
        };
        additionalProperties: false;
    };
}

interface FollowersSchema {
    schema: {
        params: {
            type: 'object';
            required: ['userId'];
            properties: {
                userId: { type: 'string' };
            };
            additionalProperties: false;
        };
        response: {
            200: {
                type: 'array';
                items: {
                    type: 'string';
                };
            };
        };
    };
}

const follow: FollowSchema = {
    body: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string' },
        },
        additionalProperties: false,
    },
};

const unfollow: FollowSchema = {
    body: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string' },
        },
        additionalProperties: false,
    },
};

const followers: FollowersSchema = {
    schema: {
        params: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string' },
            },
            additionalProperties: false,
        },
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
    },
};

export { follow, unfollow, followers };
