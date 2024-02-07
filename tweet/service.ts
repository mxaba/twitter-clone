import { DataTypes, Model, Sequelize } from 'sequelize';

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
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
    Tweet.initialize(this.sequelize);
  }

  async fetchTweets(userIds: string[]) {
    return Tweet.findAll({
      where: { userId: userIds },
      order: [['createdAt', 'DESC']],
    });
  }

  async addTweet(user: string, text: string) {
    return Tweet.create({ userId: user, text });
  }
}

export { Tweet, TweetService };
