import { DataTypes, Model } from 'sequelize';

class Tweet extends Model {
  public id!: string;
  public userId!: string;
  public text!: string;
  public createdAt!: Date;

  static initialize(sequelize: any) {
    return this.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      sequelize,
      modelName: 'Tweet',
    });
  }
}

class TweetService {
  private tweetModel: typeof Tweet;

  constructor(tweetModel: typeof Tweet) {
    this.tweetModel = tweetModel;
  }

  async fetchTweets(userIds: string[]) {
    return this.tweetModel.findAll({
      where: { userId: userIds },
      order: [['createdAt', 'DESC']],
    });
  }

  async addTweet(user: string, text: string) {
    return this.tweetModel.create({ userId: user, text });
  }
}

export { Tweet, TweetService };
