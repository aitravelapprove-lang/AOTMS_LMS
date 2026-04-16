const mongoose = require('mongoose');
require('dotenv').config();

async function listCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/New_LMS');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:');
        collections.forEach(c => console.log(`- ${c.name}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listCollections();
