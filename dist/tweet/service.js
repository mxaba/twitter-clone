"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetService = exports.Tweet = void 0;
const sequelize_1 = require("sequelize");
class Tweet extends sequelize_1.Model {
    id;
    userId;
    text;
    createdAt;
    static initialize(sequelize) {
        return this.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                primaryKey: true,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
            },
            userId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            text: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            modelName: 'Tweet',
        });
    }
}
exports.Tweet = Tweet;
class TweetService {
    sequelize;
    constructor(sequelize) {
        this.sequelize = sequelize;
        Tweet.initialize(this.sequelize);
    }
    async fetchTweets(userIds) {
        return Tweet.findAll({
            where: { userId: userIds },
            order: [['createdAt', 'DESC']],
        });
    }
    async addTweet(user, text) {
        return Tweet.create({ userId: user, text });
    }
}
exports.TweetService = TweetService;
