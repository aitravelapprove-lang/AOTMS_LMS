const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function debug() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI not found');
        console.log(`Connecting to: ${uri.split('@')[1]}`);
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const StudentExamAccess = mongoose.model('StudentExamAccess', new mongoose.Schema({
            student_id: mongoose.Schema.Types.ObjectId,
            question_bank_topic: String,
            exam_id: mongoose.Schema.Types.ObjectId,
            mock_paper_id: mongoose.Schema.Types.ObjectId,
            access_type: String
        }, { collection: 'studentexamaccesses' }));

        const topic = "Emded System";
        const topicRegex = new RegExp(`^${topic.trim()}$`, 'i');
        
        const results = await StudentExamAccess.find({ 
            $or: [
                { question_bank_topic: topicRegex }
            ]
        }).lean();

        console.log(`Found ${results.length} total records for topic: "${topic}"`);
        results.forEach((r, i) => {
            console.log(`${i+1}. StudentID: ${r.student_id}, Topic: "${r.question_bank_topic}", Type: ${r.access_type}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
