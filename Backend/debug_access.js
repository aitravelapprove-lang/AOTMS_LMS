const mongoose = require('mongoose');
require('dotenv').config();

// Define Schemas manually for debug to avoid import issues
const StudentExamAccess = mongoose.model('StudentExamAccess', new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question_bank_topic: String,
    exam_id: mongoose.Schema.Types.ObjectId,
    mock_paper_id: mongoose.Schema.Types.ObjectId,
    access_type: String
}));

const User = mongoose.model('User', new mongoose.Schema({
    full_name: String,
    email: String
}));

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/New_LMS');
        console.log('Connected to DB');

        const topic = "Emded System";
        const topicRegex = new RegExp(`^${topic.trim()}$`, 'i');
        
        console.log(`Searching for topic: "${topic}" using regex: ${topicRegex}`);

        const results = await StudentExamAccess.find({ 
            $or: [
                { question_bank_topic: topicRegex },
                { question_bank_topic: topic }
            ]
        }).populate('student_id').lean();

        console.log(`Found ${results.length} records in StudentExamAccess`);
        results.forEach((r, i) => {
            console.log(`Result ${i+1}:`);
            console.log(`- Topic: "${r.question_bank_topic}"`);
            console.log(`- Student ID: ${r.student_id?._id || r.student_id}`);
            console.log(`- Student Name: ${r.student_id?.full_name}`);
            console.log(`- Access Type: ${r.access_type}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
