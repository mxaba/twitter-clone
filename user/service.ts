import { errors } from '../errors';
import { Model, Sequelize, DataTypes, Op } from 'sequelize';
import bcrypt from 'bcrypt';


class User extends Model {
  public id!: string;
  public username!: string;
  public password!: string;
  public email!: string;

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
        email: {
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

  async register(username: string, email: string, password: string): Promise<string> {
    try {
      const user = await User.create({ username, email, password });
      console.log("user", user)
      return user.id;
    } catch (error) {
      if ((error as any).name === 'SequelizeUniqueConstraintError') {
        throw new Error(errors.USERNAME_IS_NOT_AVAILABLE);
      }
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username }, attributes: { exclude: ['password'] } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email }, attributes: { exclude: ['password'] } });
  }

  async login(usernameOrEmail: string, password: string): Promise<User | null> {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
      }
    });

    console.log("user >>> ", user)

    if (!user || !password) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  }

  async getProfile(id: string): Promise<User | null> {
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  }
  async search(searchString: string): Promise<User[]> {
    return User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${searchString}%` } },
          { email: { [Op.like]: `%${searchString}%` } }
        ]
      },
      limit: 5,
      attributes: { exclude: ['password'] }
    });
  }

  async findUsersByUsername(usernames: string[]) {
    const users = [];
    const notFoundUsers = [];
    const ids = [];
  
    for (const username of usernames) {
      try {
        const user = await this.findByUsername(username);
        if (user) {
          users.push(user);
          ids.push(username);
        } else {
          notFoundUsers.push(username);
        }
      } catch (error) {
        console.error(`Error finding user "${username}":`, error);
        notFoundUsers.push(username);
      }
    }
    return {users: users, usernames: ids};
  }
}

export { UserService, User };
