import { DataTypes } from 'sequelize';

const userProfileOutput = {
    _id: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING }
};

const registration = {
    body: {
        username: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING }
    },
    response: {
        200: {
            userId: { type: DataTypes.STRING }
        }
    }
};

const login = {
    body: {
        username: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING }
    },
    response: {
        200: {
            jwt: { type: DataTypes.STRING }
        }
    }
};

const search = {
    querystring: {
        search: { type: DataTypes.STRING }
    },
    response: {
        200: userProfileOutput
    }
};

const getProfile = {
    params: {
        userId: {
            type: DataTypes.STRING,
            validate: {
                is: /^[0-9a-fA-F]{24}$/
            }
        }
    },
    response: {
        200: userProfileOutput
    }
};

export {
    registration,
    login,
    search,
    getProfile
};
