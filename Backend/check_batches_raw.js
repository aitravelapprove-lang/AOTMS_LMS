require('dotenv').config();
const mongoose = require('mongoose');
const { Batch } = require('./models/Batch');

async function checkBatches() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const allBatches = await Batch.find({}).lean();
        console.log('Total Batches:', allBatches.length);
        
        allBatches.forEach(b => {
            console.log(`- Batch: "${b.batch_name}" | Type: ${b.batch_type} | Course: ${b.course_id} | Instructor: ${b.instructor_id}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBatches();
