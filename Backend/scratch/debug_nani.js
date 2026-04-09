const mongoose = require('mongoose');
const { QuestionBank, StudentExamAccess, Exam } = require('../models/Exam');
const { User } = require('../models/User');
require('dotenv').config();

async function checkData() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ full_name: /Nani/i });
    if (!user) {
        console.log('User Nani not found');
        return;
    }
    console.log(`Found user Nani: ${user._id} (${user.email})`);

    const accesses = await StudentExamAccess.find({ student_id: user._id }).lean();
    console.log(`Accesses for Nani: ${accesses.length}`);
    accesses.forEach(a => console.log(` - Type: ${a.access_type}, Topic: ${a.question_bank_topic}, Exam: ${a.exam_id}`));

    const qbs = await QuestionBank.find({ approval_status: 'approved' }).distinct('topic');
    console.log(`Approved Topics: ${qbs.join(', ')}`);

    const aiMlQbs = await QuestionBank.find({ topic: 'AI ML' }).lean();
    console.log(`AI ML Questions count: ${aiMlQbs.length}`);
    if (aiMlQbs.length > 0) {
        console.log(`AI ML Status: ${aiMlQbs[0].approval_status}`);
    }

    await mongoose.disconnect();
}

checkData().catch(console.error);
