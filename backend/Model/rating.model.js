import { DataTypes } from 'sequelize';
import { sequelize } from '../DB/DB.Connection.js';
import User from './user.model.js';
import Store from './store.model.js';

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
}, {
  timestamps: true,
  freezeTableName: true, 
});

User.belongsToMany(Store, { through: Rating, foreignKey: 'userId', onDelete: 'CASCADE' });
Store.belongsToMany(User, { through: Rating, foreignKey: 'storeId', onDelete: 'CASCADE' });

Rating.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'storeId', onDelete: 'CASCADE' });

export default Rating; 