const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Delete all batches with type 'all'
        // These were the "Full Daily Unit" container batches
        const deleteResult = await mongoose.connection.collection('batches').deleteMany({ batch_type: 'all' });
        console.log(`Deleted ${deleteResult.deletedCount} 'all' type batches`);

        // 2. Clear out any student assignments that were pointing to these deleted batches
        // Actually, those assignments might have used the parent ID
        // But since we just want a clean slate for 'all', we search for assignments 
        // that no longer have a valid batch.
        
        console.log('Cleanup complete');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
