const mongoose = require('mongoose');
const { ResumeScan } = require('../models/User'); // Fixed path
require('dotenv').config();

async function testApi() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log("Connected to:", uri.split('@')[1] || uri);

        const scans = await ResumeScan.find();
        console.log("Mongoose Count:", scans.length);
        if (scans.length > 0) {
            console.log("Model Collection Name:", ResumeScan.collection.name);
            console.log("First item user_id type:", typeof scans[0].user_id);
            console.log("First item:", scans[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testApi();
