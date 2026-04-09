require('dotenv').config();
const mongoose = require('mongoose');

async function debug() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
        await mongoose.connect(uri);
        
        const resumeScans = await mongoose.connection.db.collection('resumescans').find({}).toArray();
        console.log("Count:", resumeScans.length);
        if (resumeScans.length > 0) {
            console.log("Sample User ID Type:", typeof resumeScans[0].user_id);
            console.log("Sample Data:", JSON.stringify(resumeScans[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
