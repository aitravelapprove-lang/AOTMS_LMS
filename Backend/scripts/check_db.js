const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDB() {
    await mongoose.connect(process.env.MONGO_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check ExamResults specifically
    // Try both naming conventions
    const names = ['examresults', 'ExamResults', 'exam_results'];
    for(const name of names) {
        const count = await mongoose.connection.db.collection(name).countDocuments();
        console.log(`Collection ${name}: ${count} docs`);
        if (count > 0) {
            const sample = await mongoose.connection.db.collection(name).findOne();
            console.log(`Sample from ${name}:`, JSON.stringify(sample, null, 2));
        }
    }
    process.exit(0);
}

checkDB();
