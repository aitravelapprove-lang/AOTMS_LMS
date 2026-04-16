const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function listRealCollections() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name).join(', '));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listRealCollections();
