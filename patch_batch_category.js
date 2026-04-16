const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://Aotms:Aotms@aotms.pskqemf.mongodb.net/lms?retryWrites=true&w=majority';

const BatchSchema = new mongoose.Schema({
    batch_category: String
}, { strict: false });

const Batch = mongoose.model('Batch', BatchSchema);

async function patch() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const result = await Batch.updateMany(
            { batch_category: { $exists: false } },
            { $set: { batch_category: 'approve' } }
        );

        console.log(`Updated ${result.modifiedCount} batches with default batch_category: 'approve'`);
        process.exit(0);
    } catch (err) {
        console.error('Patch failed:', err);
        process.exit(1);
    }
}

patch();
