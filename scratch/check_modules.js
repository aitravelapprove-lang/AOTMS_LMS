const mongoose = require('mongoose');
require('dotenv').config({ path: '../Backend/.env' });

const mongoURI = process.env.MONGO_URI;

async function checkModules() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');
        
        const CourseModule = mongoose.connection.collection('course_modules');
        const modules = await CourseModule.find({}).toArray();
        
        console.log(`Found ${modules.length} modules.`);
        
        console.log('--- Modules with allowed_batches ---');
        modules.forEach(m => {
            if (m.allowed_batches && m.allowed_batches.length > 0) {
                console.log(`Title: ${m.title}`);
                console.log(`ID: ${m._id}`);
                console.log(`Allowed Batches: ${JSON.stringify(m.allowed_batches)}`);
                console.log('---');
            }
        });
        
        // Also check Batch structure
        const Batch = mongoose.connection.collection('batches');
        const someBatches = await Batch.find({}).limit(5).toArray();
        console.log('--- Sample Batch Structure ---');
        someBatches.forEach(b => {
             console.log(`Batch: ${b.batch_name} (${b.batch_type}) ID: ${b._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkModules();
