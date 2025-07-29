import { sequelize } from './DB.Connection.js';
import '../Model/user.model.js';
import '../Model/store.model.js';
import '../Model/rating.model.js';

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Database sync failed:', err);
    process.exit(1);
  }
})(); 