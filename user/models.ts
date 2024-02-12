const userProfileOutput = {
    _id: { type: 'string' },
    username: { type: 'string' }
};

const registration = {
    body: {
        email: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string' }
    },
    response: {
        200: {
            userId: { type: 'string' }
        }
    }
};

const login = {
    body: {
        username: { type: 'string' },
        password: { type: 'string' }
    },
    response: {
        200: {
            jwt: { type: 'string' }
        }
    }
};

const search = {
    querystring: {
        search: { type: 'string' }
    },
    response: {
        200: userProfileOutput
    }
};

const getProfile = {
    params: {
        userId: {
            type: 'string' ,
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
