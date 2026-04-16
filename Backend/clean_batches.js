const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BatchSchema = new mongoose.Schema({
    batch_type: String
}, { strict: false });

const Batch = mongoose.model('Batch', BatchSchema);

async function cleanBatches() {
    // Correct env variable name is MONGO_URI
    const uri = process.env.MONGO_URI;
    console.log(`Connecting to: ${uri}`);
    
    try {
        await mongoose.connect(uri);
        console.log('Connected to Atlas MongoDB.');

        const result = await Batch.updateMany(
            { batch_type: 'all' },
            { 
                $unset: { 
                    start_time: "", 
                    end_time: "", 
                    max_students: "", 
                    is_active: "", 
                    status: "", 
                    batch_category: "" 
                } 
            }
        );

        console.log(`Successfully cleaned ${result.modifiedCount} existing batch records from Atlas.`);
        process.exit(0);
    } catch (err) {
        console.error('Error cleaning batches:', err);
        process.exit(1);
    }
}

cleanBatches();
