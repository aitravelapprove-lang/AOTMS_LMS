const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { User } = require('../models/User');

async function checkUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoUri);
    
    const count = await User.countDocuments({});
    console.log(`Total users in DB: ${count}`);
    
    const users = await User.find({}).limit(5);
    users.forEach(u => console.log(u));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
