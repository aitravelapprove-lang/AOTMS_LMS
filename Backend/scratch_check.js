const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const mongoURI = process.env.MONGO_URI;

async function checkModules() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');
        
        const Module = mongoose.connection.collection('modules');
        const modules = await Module.find({}).toArray();
        
        console.log(`Found ${modules.length} modules total.`);
        
        const restrictedModules = modules.filter(m => m.allowed_batches && m.allowed_batches.length > 0);
        console.log(`Found ${restrictedModules.length} modules with batch restrictions.`);
        
        restrictedModules.forEach(m => {
            console.log(`Title: ${m.title}`);
            console.log(`ID: ${m._id}`);
            console.log(`Allowed Batches: ${JSON.stringify(m.allowed_batches)}`);
            console.log('---');
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkModules();
