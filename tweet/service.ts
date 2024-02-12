import { DataTypes, Model, Sequelize } from 'sequelize';

class Tweet extends Model {
    public id!: string;
    public userId!: string;
    public text!: string;
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
                type: DataTypes.UUID,
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

    async fetchTweets(userIds: string[]) {
        return Tweet.findAll({
            where: { userId: userIds },
            order: [['createdAt', 'DESC']],
        });
    }

    async addTweet(user: string, content: string, tags: string) { 
        return Tweet.create({ userId: user, content, tags });
    }
}

export { Tweet, TweetService };
