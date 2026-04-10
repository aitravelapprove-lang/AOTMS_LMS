const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = ['exam_schedulings', 'exams', 'examschedules'];
        
        for (const collName of collections) {
            try {
                await mongoose.connection.db.dropCollection(collName);
                console.log(`Dropped collection: ${collName}`);
            } catch (e) {
                console.log(`Collection ${collName} did not exist or could not be dropped: ${e.message}`);
            }
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
}

cleanup();
