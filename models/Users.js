import { DataTypes, Model } from 'sequelize';
import md5 from 'md5';
import sequelize from '../services/sequelize';

const { PASSWORD_SECRET } = process.env;

class Users extends Model {
  static passHash = (password) => md5(md5(password) + PASSWORD_SECRET);
}

Users.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'email',
  },
  password: {
    type: DataTypes.CHAR(32),
    allowNull: false,
    get() {
      return undefined;
    },
    set(val) {
      if (val) {
        this.setDataValue('password', Users.passHash(val));
      }
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      let avatar = this.getDataValue('avatar');
      const email = this.getDataValue('email');
      if (!avatar && email) {
        avatar = `https://www.gravatar.com/avatar/${md5(email.toLowerCase())}?d=robohash`;
      }
      return avatar;
    },
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  modelName: 'users',
  tableName: 'users',
  sequelize,
});

export default Users;
