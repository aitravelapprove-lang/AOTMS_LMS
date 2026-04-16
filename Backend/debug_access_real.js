const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function debug() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI not found');
        console.log(`Connecting to: ${uri.split('@')[1]}`); // Mask credentials
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name).join(', '));

        const StudentExamAccess = mongoose.model('StudentExamAccess', new mongoose.Schema({
            student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            question_bank_topic: String,
            exam_id: mongoose.Schema.Types.ObjectId,
            mock_paper_id: mongoose.Schema.Types.ObjectId,
            access_type: String
        }, { collection: 'studentexamaccesses' }));

        const topic = "Emded System";
        const topicRegex = new RegExp(`^${topic.trim()}$`, 'i');
        
        console.log(`Searching for topic: "${topic}" using regex: ${topicRegex}`);

        const results = await StudentExamAccess.find({ 
            $or: [
                { question_bank_topic: topicRegex }
            ]
        }).lean();

        console.log(`Found ${results.length} total raw records for this topic regex`);
        
        const populated = await StudentExamAccess.find({ 
            $or: [
                { question_bank_topic: topicRegex }
            ]
        }).populate('student_id').lean();

        console.log(`Found ${populated.length} populated records`);
        populated.forEach((r, i) => {
            console.log(`Result ${i+1}:`);
            console.log(`- Topic: "${r.question_bank_topic}"`);
            console.log(`- Student ID field in DB: ${r.student_id?._id || r.student_id}`);
            console.log(`- Student Name (Populated): ${r.student_id?.full_name || 'NULL'}`);
            console.log(`- Student Email: ${r.student_id?.email || 'NULL'}`);
            console.log(`- Access Type: ${r.access_type}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
