const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { User } = require('../models/User'); // Register User schema
const { Course, Enrollment } = require('../models/Course');

const INSTRUCTOR_ID = '69bc3f374ad1dcfab384f470';

async function detailEnrollments() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);

    const courses = await Course.find({
      instructor_ids: new mongoose.Types.ObjectId(INSTRUCTOR_ID)
    });

    const courseIds = courses.map(c => c._id);
    
    // We need to make sure the Enrollment model knows about the "User" model for population
    const enrollments = await Enrollment.find({
      course_id: { $in: courseIds }
    }).populate({
      path: 'user_id',
      select: 'full_name email',
      model: User
    });

    console.log(`--- Enrollment Details for ${INSTRUCTOR_ID} ---`);
    if (enrollments.length === 0) {
      console.log('No students enrolled in any courses for this instructor.');
    } else {
      enrollments.forEach(e => {
        const student = e.user_id;
        console.log(`Student: ${student?.full_name || 'Unknown'} | Email: ${student?.email || 'N/A'} | Status: ${e.status} | Course: ${courses.find(c => c._id.toString() === e.course_id.toString())?.title}`);
      });
    }
    console.log('-------------------------------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

detailEnrollments();
