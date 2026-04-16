const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function checkExamSchedulings() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected');

        const topic = "Emded System";

        const docs = await mongoose.connection.db.collection('exam_schedulings').find({ 
            $or: [
                { title: new RegExp(`^${topic}$`, 'i') }
            ]
        }).toArray();

        console.log(`Documents in exam_schedulings matching "${topic}":`, docs.length);
        docs.forEach(d => console.log(`- ID: ${d._id}, Title: "${d.title}"`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkExamSchedulings();
