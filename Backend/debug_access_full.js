const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function debugFull() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        const StudentExamAccess = mongoose.model('StudentExamAccess', new mongoose.Schema({}, { strict: false }), 'studentexamaccesses');

        const docs = await StudentExamAccess.find({ 
            $or: [
                { question_bank_topic: /Emded/i },
                { exam_id: { $exists: true } },
                { mock_paper_id: { $exists: true } }
            ]
        }).limit(5).lean();

        console.log('Sample Records:');
        docs.forEach(d => console.log(JSON.stringify(d, null, 2)));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugFull();
