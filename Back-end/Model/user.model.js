import { DataTypes } from 'sequelize';
import { sequelize } from '../DB/DB.Connection.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [20, 60],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [0, 400],
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'owner'),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  timestamps: true,
  freezeTableName: true,
});

User.isAdmin = function(user) {
  return user.role === 'admin';
};
User.isOwner = function(user) {
  return user.role === 'owner';
};
User.isUser = function(user) {
  return user.role === 'user';
};

export default User;