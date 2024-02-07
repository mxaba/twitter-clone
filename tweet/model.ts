import { DataTypes, Model } from 'sequelize';

class Tweet extends Model {
  public id!: string;
  public userId!: string;
  public text!: string;

  static initialize(sequelize: any) {
    return this.init({
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 144],
        },
      },
    }, {
      sequelize,
      modelName: 'Tweet',
    });
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

export { Tweet, getUserTweetsModel, getTweetsModel };
