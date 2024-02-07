"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.search = exports.login = exports.registration = void 0;
const sequelize_1 = require("sequelize");
const userProfileOutput = {
    _id: { type: sequelize_1.DataTypes.STRING },
    username: { type: sequelize_1.DataTypes.STRING }
};
const registration = {
    body: {
        username: { type: sequelize_1.DataTypes.STRING },
        password: { type: sequelize_1.DataTypes.STRING }
    },
    response: {
        200: {
            userId: { type: sequelize_1.DataTypes.STRING }
        }
    }
};
exports.registration = registration;
const login = {
    body: {
        username: { type: sequelize_1.DataTypes.STRING },
        password: { type: sequelize_1.DataTypes.STRING }
    },
    response: {
        200: {
            jwt: { type: sequelize_1.DataTypes.STRING }
        }
    }
};
exports.login = login;
const search = {
    querystring: {
        search: { type: sequelize_1.DataTypes.STRING }
    },
    response: {
        200: userProfileOutput
    }
};
exports.search = search;
const getProfile = {
    params: {
        userId: {
            type: sequelize_1.DataTypes.STRING,
            validate: {
                is: /^[0-9a-fA-F]{24}$/
            }
        }
    },
    response: {
        200: userProfileOutput
    }
};
exports.getProfile = getProfile;
