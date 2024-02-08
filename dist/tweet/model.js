"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTweetsModel = exports.getUserTweetsModel = exports.tweet = void 0;
const sequelize_1 = require("sequelize");
const tweet = {
    body: {
        type: 'object',
        required: ['text'],
        properties: {
            text: { type: sequelize_1.DataTypes.STRING, minLength: 1, maxLength: 144 }
        },
        additionalProperties: false
    }
};
exports.tweet = tweet;
const getUserTweetsModel = {
    params: {
        type: 'object',
        required: ['userIds'],
        properties: {
            userIds: {
                type: sequelize_1.DataTypes.STRING,
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
                    id: { type: sequelize_1.DataTypes.STRING },
                    userId: { type: sequelize_1.DataTypes.STRING },
                    text: { type: sequelize_1.DataTypes.STRING },
                },
            },
        },
    },
};
exports.getUserTweetsModel = getUserTweetsModel;
const getTweetsModel = {
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: sequelize_1.DataTypes.STRING },
                    userId: { type: sequelize_1.DataTypes.STRING },
                    text: { type: sequelize_1.DataTypes.STRING },
                },
            },
        },
    },
};
exports.getTweetsModel = getTweetsModel;
