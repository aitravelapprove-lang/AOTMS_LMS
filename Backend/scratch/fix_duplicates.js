const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { StudentBatch } = require('../models/Batch');

async function fixDuplicates() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all student-course pairs that have more than 1 entry
    const duplicates = await StudentBatch.aggregate([
      {
        $group: {
          _id: { student_id: "$student_id", course_id: "$course_id" },
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`Found ${duplicates.length} duplicate student-course batch assignments.`);

    for (const dup of duplicates) {
      console.log(`Fixing student ${dup._id.student_id} in course ${dup._id.course_id}...`);
      // Keep the first one, delete the rest
      const [keepId, ...deleteIds] = dup.ids;
      
      const result = await StudentBatch.deleteMany({ _id: { $in: deleteIds } });
      console.log(`  Deleted ${result.deletedCount} duplicate entries. Kept ID: ${keepId}`);
    }

    // Try to ensure the index to prevent future duplicates
    try {
      await StudentBatch.collection.createIndex({ student_id: 1, course_id: 1 }, { unique: true });
      console.log('Unique index ensured on student_id and course_id.');
    } catch (indexErr) {
      console.warn('Could not ensure unique index (maybe check for remaining hidden duplicates):', indexErr.message);
    }

    await mongoose.disconnect();
    console.log('Done.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDuplicates();
