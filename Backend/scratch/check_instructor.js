const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { User } = require('../models/User');

const INSTRUCTOR_ID = '69bc3f374ad1dcfab384f470';

async function checkInstructor() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    const user = await User.findById(INSTRUCTOR_ID);
    if (user) {
      console.log(`Instructor Name: ${user.full_name}`);
      console.log(`Instructor Email: ${user.email}`);
    } else {
      console.log('Instructor not found by ID in User model.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkInstructor();
