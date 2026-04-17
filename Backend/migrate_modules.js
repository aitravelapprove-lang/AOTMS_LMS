const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const mongoURI = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');
        
        const Batch = mongoose.connection.collection('batches');
        const Module = mongoose.connection.collection('modules');
        
        const batches = await Batch.find({}).toArray();
        const idToTypeMap = {};
        
        batches.forEach(b => {
            // Parent batch
            idToTypeMap[b._id.toString()] = b.batch_type;
            
            // Sub batches
            if (b.batches && Array.isArray(b.batches)) {
                b.batches.forEach(nb => {
                    const id = nb._id ? nb._id.toString() : `${b._id.toString()}_${nb.batch_type}`;
                    idToTypeMap[id] = nb.batch_type;
                });
            }
        });
        
        const modules = await Module.find({}).toArray();
        console.log(`Processing ${modules.length} modules...`);
        
        for (const m of modules) {
            let determinedType = null;
            
            if (m.allowed_batches && m.allowed_batches.length > 0) {
                // Find types for allowed batches
                const types = m.allowed_batches
                    .map(id => idToTypeMap[id.toString()])
                    .filter(t => t);
                
                const uniqueTypes = [...new Set(types)];
                
                if (uniqueTypes.length === 1) {
                    determinedType = uniqueTypes[0];
                } else if (uniqueTypes.length > 1) {
                    determinedType = 'all'; // Multiple slots select, effectively all sessions of the parent
                }
            } else {
                 // No restrictions = global = practically "all" sessions
                 determinedType = 'all';
            }
            
            if (determinedType) {
                await Module.updateOne(
                    { _id: m._id },
                    { $set: { batch_type: determinedType } }
                );
                console.log(`Updated module "${m.title}" to batch_type: ${determinedType}`);
            }
        }
        
        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
