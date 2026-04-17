require('dotenv').config();
const mongoose = require('mongoose');
const { Batch } = require('./models/Batch');

async function checkBatches() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const b = await Batch.findOne({ batch_name: "AI&ML ALL Sections" }).lean();
        console.log('Batch found:', b.batch_name);
        console.log('Nested batches:', b.batches || 'None');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBatches();
