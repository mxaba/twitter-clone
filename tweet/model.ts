import { DataTypes, Model } from 'sequelize';

const tweet = {
    body: {
        type: 'object',
        required: [ 'text' ],
        properties: {
          text: { type: 'string', minLength: 1, maxLength: 144 }
        },
        additionalProperties: false
      }
}

const getUserTweetsModel = {
  params: {
    type: 'object',
    required: ['userIds'],
    properties: {
      userIds: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}(,[0-9a-fA-F]{24})?',
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
        },
      },
    },
  },
};

export { tweet, getUserTweetsModel, getTweetsModel };
