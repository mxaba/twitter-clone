const timeline = {
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    content: { type: 'string' },
                    tags: { type: 'string'},
                    createdAt: { type: 'string'},
                },
            },
        },
    },
};

export default timeline;
