import { DataTypes, Model } from 'sequelize';

const tweet = {
    body: {
        type: 'object',
        required: [ 'text' ],
        properties: {
          text: { type: DataTypes.STRING, minLength: 1, maxLength: 144 }
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
        type: DataTypes.STRING,
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
          id: { type: DataTypes.STRING },
          userId: { type: DataTypes.STRING },
          text: { type: DataTypes.STRING },
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
          id: { type: DataTypes.STRING },
          userId: { type: DataTypes.STRING },
          text: { type: DataTypes.STRING },
        },
      },
    },
  },
};

export { tweet, getUserTweetsModel, getTweetsModel };
