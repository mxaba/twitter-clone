import { DataTypes, Model, Op, Sequelize } from 'sequelize';

class Tweet extends Model {
    public id!: string;
    public userId!: string;
    public content!: string;
    public createdAt!: Date;
    public tags!: string;

    static initialize(sequelize: Sequelize) {
        return this.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            tags: {
                type: DataTypes.STRING,
                allowNull: true,
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

    async fetchTweets(userId: string[]) {
        return Tweet.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
        });
    }

    async addTweet(user: string, content: string, tags: string) {
        return Tweet.create({ userId: user, content: content, tags: tags });
    }

    async fetchTweetsByTaggedUser(taggedUserId: string): Promise<Tweet[]> {
        return Tweet.findAll({
            where: {
                tags: {
                    [Op.contains]: [taggedUserId]
                }
            },
            order: [['createdAt', 'DESC']],
        });
    }

    async fetchAllTweets(): Promise<Tweet[]> {
        return Tweet.findAll({
            order: [['createdAt', 'DESC']],
        });
    }
}

export { Tweet, TweetService };
