import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';

class Messages extends Model {

}

Messages.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
  },
  seen: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'messages',
  modelName: 'messages',
  sequelize,
});

Messages.belongsTo(Users, {
  foreignKey: 'from',
  as: 'userFrom',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});
Users.hasMany(Messages, {
  foreignKey: 'from',
  as: 'messagesFrom',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Messages.belongsTo(Users, {
  foreignKey: 'to',
  as: 'userTo',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Users.hasMany(Messages, {
  foreignKey: 'to',
  as: 'messagesTo',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Messages.belongsTo(Messages, {
  foreignKey: 'parentId',
  as: 'parent',
  onUpdate: 'cascade',
  onDelete: 'set null',
});

export default Messages;
