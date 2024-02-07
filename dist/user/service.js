"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserService = void 0;
const errors_1 = require("../errors");
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    id;
    username;
    password;
    static initialize(sequelize) {
        this.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true
            },
            username: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'User'
        });
    }
}
exports.User = User;
class UserService {
    sequelize;
    constructor(sequelize) {
        this.sequelize = sequelize;
        User.initialize(this.sequelize);
    }
    async register(username, password) {
        try {
            const user = await User.create({ username, password });
            return user.id;
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error(errors_1.errors.USERNAME_IS_NOT_AVAILABLE);
            }
            throw error;
        }
    }
    async login(username, password) {
        const user = await User.findOne({ where: { username, password }, attributes: { exclude: ['password'] } });
        if (!user)
            throw new Error('Wrong credentials');
        return user;
    }
    async getProfile(id) {
        return User.findByPk(id, { attributes: { exclude: ['password'] } });
    }
    async search(searchString) {
        return User.findAll({
            where: {
                username: { [sequelize_1.Op.iLike]: `%${searchString}%` }
            },
            limit: 5,
            attributes: { exclude: ['password'] }
        });
    }
}
exports.UserService = UserService;
