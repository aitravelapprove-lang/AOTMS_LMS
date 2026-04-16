const mongoose = require('mongoose');
const { Batch } = require('./Backend/models/Batch');

async function fix() {
    try {
        await mongoose.connect('mongodb://localhost:27017/lms_new');
        console.log('Connected to MongoDB');
        const res = await Batch.updateMany({}, { $set: { is_active: true, status: 'approved' } });
        console.log('Update result:', res);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fix();
