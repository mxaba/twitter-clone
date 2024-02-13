'use strict';

interface Config {
    SQLITE_PATH: string;
    REDIS_URL: string;
    JWT_SECRET: string;
}

const config: Config = {
    SQLITE_PATH: '/db/database.test.db',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'the-secret'
};

export default config;
