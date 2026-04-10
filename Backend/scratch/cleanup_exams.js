const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanup() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI not found in .env');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB...');

        // Drop the old 'exams' collection
        const collections = await mongoose.connection.db.listCollections({ name: 'exams' }).toArray();
        if (collections.length > 0) {
            await mongoose.connection.db.dropCollection('exams');
            console.log('Successfully dropped old "exams" collection.');
        } else {
            console.log('Old "exams" collection not found or already deleted.');
        }

        // Also drop 'examschedules' if needed
        const schedules = await mongoose.connection.db.listCollections({ name: 'examschedules' }).toArray();
        if (schedules.length > 0) {
            await mongoose.connection.db.dropCollection('examschedules');
            console.log('Successfully dropped "examschedules" collection.');
        }

        console.log('Cleanup complete. System is now using "exam_schedulings".');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
