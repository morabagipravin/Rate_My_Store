import { sequelize } from './DB/DB.Connection.js';
import User from './Model/user.model.js';
import Store from './Model/store.model.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Test data
    const testStore = {
      name: 'Test Store',
      email: 'teststore@example.com',
      address: 'Test Address',
      ownerId: 6  // This user exists and is an owner
    };
    
    console.log('Testing store creation with:', testStore);
    
    // Check if owner exists
    const owner = await User.findByPk(6);
    if (!owner) {
      console.log('❌ Owner not found with ID: 6');
      return;
    }
    console.log('✅ Owner found:', owner.name, 'Role:', owner.role);
    
    if (owner.role !== 'owner') {
      console.log('❌ User is not an owner. Role:', owner.role);
      return;
    }
    console.log('✅ User is a valid owner');
    
    // Check if store email already exists
    const existing = await Store.findOne({ where: { email: testStore.email } });
    if (existing) {
      console.log('❌ Store with email already exists:', testStore.email);
      return;
    }
    console.log('✅ Email is available');
    
    // Try to create store
    const store = await Store.create(testStore);
    console.log('✅ Store created successfully:', store.id);
    
    // Clean up - delete the test store
    await Store.destroy({ where: { id: store.id } });
    console.log('✅ Test store cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})(); 