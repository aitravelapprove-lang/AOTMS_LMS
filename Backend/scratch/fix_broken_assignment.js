const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { StudentBatch } = require('../models/Batch');

async function fixBrokenAssignment() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete the entry with mismatched course ID for the batch
    const entryIdToDelete = '69d8f986aaf08ace1650015c';
    const result = await StudentBatch.deleteOne({ _id: new mongoose.Types.ObjectId(entryIdToDelete) });
    
    if (result.deletedCount > 0) {
      console.log(`Successfully deleted broken assignment entry ${entryIdToDelete}`);
    } else {
      console.log('Entry not found or already deleted.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixBrokenAssignment();
