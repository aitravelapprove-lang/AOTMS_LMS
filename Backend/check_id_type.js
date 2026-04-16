const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function checkIdType() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        const StudentExamAccess = mongoose.connection.db.collection('studentexamaccesses');

        const doc = await StudentExamAccess.findOne({ question_bank_topic: /Emded/i });
        if (doc) {
            console.log('Document found:');
            console.log('student_id type:', typeof doc.student_id);
            console.log('student_id instance of ObjectId:', doc.student_id instanceof mongoose.Types.ObjectId);
            console.log('Raw student_id:', doc.student_id);
        } else {
            console.log('No document found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIdType();
