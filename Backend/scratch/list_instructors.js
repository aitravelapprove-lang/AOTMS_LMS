const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { User, UserRole } = require('../models/User');

async function listInstructors() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoUri);
    
    const instructorRoles = await UserRole.find({ role: 'instructor' });
    const userIds = instructorRoles.map(ir => ir.user_id);
    
    const users = await User.find({ _id: { $in: userIds } });
    
    console.log('--- Instructors ---');
    users.forEach(u => {
      console.log(`ID: ${u._id} | Name: ${u.full_name} | Email: ${u.email}`);
    });
    console.log('-------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listInstructors();
