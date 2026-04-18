const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = ['examrules', 'examschedules'];
        
        for (const colName of collections) {
            try {
                await mongoose.connection.db.dropCollection(colName);
                console.log(`Dropped collection: ${colName}`);
            } catch (e) {
                if (e.codeName === 'NamespaceNotFound') {
                    console.log(`Collection ${colName} already does not exist.`);
                } else {
                    console.error(`Error dropping ${colName}:`, e.message);
                }
            }
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

cleanup();
