const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Course, Enrollment } = require('../models/Course');
const { User } = require('../models/User');

const INSTRUCTOR_ID = '69bc3f374ad1dcfab384f470';

async function countStudents() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Find all courses for this instructor
    // The instructor ID is a string, but in DB it's an ObjectId
    const courses = await Course.find({
      instructor_ids: new mongoose.Types.ObjectId(INSTRUCTOR_ID)
    });

    const courseIds = courses.map(c => c._id);
    console.log(`Found ${courses.length} courses for instructor ${INSTRUCTOR_ID}`);

    if (courseIds.length === 0) {
      console.log('No courses found for this instructor.');
      await mongoose.disconnect();
      return;
    }

    // 2. Find all unique enrollments for these courses
    const enrollments = await Enrollment.find({
      course_id: { $in: courseIds }
    });

    const uniqueStudentIds = new Set(enrollments.map(e => e.user_id.toString()));
    
    console.log('--- Results ---');
    console.log(`Total Enrollments across all courses: ${enrollments.length}`);
    console.log(`Total Unique Students: ${uniqueStudentIds.size}`);
    
    // Optional: breakdown by course
    for (const course of courses) {
      const courseEnrollments = enrollments.filter(e => e.course_id.toString() === course._id.toString()).length;
      console.log(`- Course: ${course.title} | Enrollments: ${courseEnrollments}`);
    }
    console.log('----------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

countStudents();
