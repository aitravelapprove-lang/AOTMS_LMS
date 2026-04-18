const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function dropUnusedCollections() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        const collectionsToDrop = [
            'announcements',
            'assignments',
            'colleges',
            'couponredemptions',
            'course_videos',
            'doubtreplies',
            'examrules',
            'exams',
            'instructorprogresses',
            'instructorapplications',
            'guestcredentials',
            'examschedules',
            'leads',
            'mocktestconfigs',
            'mockpapers'
        ];

        console.log('Cleanup started...');
        const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

        for (const coll of collectionsToDrop) {
            if (existingCollections.includes(coll)) {
                await db.dropCollection(coll);
                console.log(`Dropped: ${coll}`);
            } else {
                console.log(`Skipped (Not Found): ${coll}`);
            }
        }

        console.log('Database cleanup completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup Error:', err);
        process.exit(1);
    }
}

dropUnusedCollections();
