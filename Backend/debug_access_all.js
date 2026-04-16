const mongoose = require('mongoose');
require('dotenv').config();

const StudentExamAccess = mongoose.model('StudentExamAccess', new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question_bank_topic: String,
    exam_id: mongoose.Schema.Types.ObjectId,
    mock_paper_id: mongoose.Schema.Types.ObjectId,
    access_type: String
}));

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/New_LMS');
        console.log('Connected to DB');

        const allAccess = await StudentExamAccess.find({}).lean();
        console.log(`Total records in StudentExamAccess: ${allAccess.length}`);
        
        const counts = await StudentExamAccess.aggregate([
            { $group: { _id: '$question_bank_topic', count: { $sum: 1 } } }
        ]);
        console.log('Counts by question_bank_topic:');
        counts.forEach(c => console.log(`- "${c._id}": ${c.count}`));

        const qbs = await mongoose.connection.db.collection('questionbanks').distinct('topic');
        console.log('Available QuestionBank Topics:');
        qbs.forEach(t => console.log(`- "${t}"`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
