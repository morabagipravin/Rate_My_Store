import { sequelize } from './DB/DB.Connection.js';
import User from './Model/user.model.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    
    console.log('\n=== All Users in Database ===');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    const owners = users.filter(u => u.role === 'owner');
    console.log(`\n=== Store Owners (${owners.length}) ===`);
    owners.forEach(owner => {
      console.log(`ID: ${owner.id}, Name: ${owner.name}, Email: ${owner.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})(); 