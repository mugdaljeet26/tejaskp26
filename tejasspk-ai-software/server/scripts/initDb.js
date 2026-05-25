// server/scripts/initDb.js
require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Seed Admin
  const adminExists = await User.findOne({ email: 'tejaskp@gmail.com' });
  if (!adminExists) {
    const adminUser = new User({
      fullName: 'System Admin',
      email: 'tejaskp@gmail.com',
      password: 'tejas@1234',
      dept: 'engineering',
      role: 'admin',
      empId: 'TSPK-ADMIN',
      photo: ''
    });
    await adminUser.save();
    console.log('🚀 Default Admin created: tejaskp@gmail.com / tejas@1234');
  } else {
    console.log('⚡ Default Admin already exists.');
  }

  // Seed Test Employee
  const empExists = await User.findOne({ email: 'test.employee@example.com' });
  if (!empExists) {
    const testUser = new User({
      fullName: 'Test Employee',
      email: 'test.employee@example.com',
      password: 'Pass1234',
      dept: 'engineering',
      role: 'employee',
      empId: 'EMP001',
      photo: ''
    });
    await testUser.save();
    console.log('🚀 Test employee created: test.employee@example.com / Pass1234');
  } else {
    console.log('⚡ Test employee already exists.');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ DB init error:', err);
  process.exit(1);
});
