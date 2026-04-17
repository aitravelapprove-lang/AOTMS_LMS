const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanupDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        
        const collectionsToDrop = [
            'liveclasses',            // Duplicate of live_classes
            'studentexamaccesses',    // Duplicate of Grant_access
            'couponredemptions',      // Unused/Legacy
            'exam_results',           // Older variant/Wrong naming
            'ExamResults'             // Case sensitivity residue
        ];

        const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
        
        for (const col of collectionsToDrop) {
            if (existingCollections.includes(col)) {
                console.log(`Dropping unused collection: ${col}...`);
                await db.dropCollection(col);
                console.log(`Dropped ${col}.`);
            } else {
                console.log(`Collection ${col} not found or already deleted.`);
            }
        }

        console.log('Clean-up complete!');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanupDB();
