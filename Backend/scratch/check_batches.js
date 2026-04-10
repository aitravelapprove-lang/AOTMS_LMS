const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Course } = require('../models/Course');
const { Batch, StudentBatch } = require('../models/Batch');

const INSTRUCTOR_ID = '69bc3f374ad1dcfab384f470';

async function checkBatches() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const courses = await Course.find({
      instructor_ids: new mongoose.Types.ObjectId(INSTRUCTOR_ID)
    });
    const courseIds = courses.map(c => c._id);

    const batches = await Batch.find({
      course_id: { $in: courseIds }
    });
    
    for (const b of batches) {
      const studentBatches = await StudentBatch.find({ batch_id: b._id });
      console.log(`- Batch: ${b.batch_name} (ID: ${b._id}) | Course: ${b.course_id}`);
      
      for (const sb of studentBatches) {
        console.log(`  * Student ID: ${sb.student_id} | Entry ID: ${sb._id} | Course ID in Entry: ${sb.course_id}`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBatches();
