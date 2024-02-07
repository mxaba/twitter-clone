import { errors } from '../errors';
import { Model, Sequelize, DataTypes, Op } from 'sequelize';

interface UserAttributes {
  id?: string;
  username: string;
  password: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public password!: string;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'User'
      }
    );
  }
}

class UserService {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
    User.initialize(this.sequelize);
  }

  async register(username: string, password: string): Promise<string> {
    try {
      const user = await User.create({ username, password });
      return user.id;
    } catch (error) {
      if ((error as any).name === 'SequelizeUniqueConstraintError') {
        throw new Error(errors.USERNAME_IS_NOT_AVAILABLE);
      }
      throw error;
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = await User.findOne({ where: { username, password }, attributes: { exclude: ['password'] } });
    if (!user) throw new Error('Wrong credentials');
    return user;
  }

  async getProfile(id: string): Promise<User | null> {
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  }

  async search(searchString: string): Promise<User[]> {
    return User.findAll({
      where: {
        username: { [Op.iLike]: `%${searchString}%` }
      },
      limit: 5,
      attributes: { exclude: ['password'] }
    });
  }
}

export { UserService, User };
