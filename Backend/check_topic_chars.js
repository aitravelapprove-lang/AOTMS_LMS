const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function checkTopic() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected');

        const QuestionBank = mongoose.model('QuestionBank', new mongoose.Schema({
            topic: String
        }, { collection: 'questionbanks' }));

        const topics = await QuestionBank.distinct('topic');
        console.log('All Topics in DB:');
        topics.forEach(t => {
            console.log(`- "${t}" (Length: ${t.length}, CharCodes: ${Array.from(t).map(c => c.charCodeAt(0)).join(',')})`);
        });

        const accessTopics = await mongoose.connection.db.collection('studentexamaccesses').distinct('question_bank_topic');
        console.log('All Topics in StudentExamAccess:');
        accessTopics.forEach(t => {
            console.log(`- "${t}" (Length: ${t?.length}, CharCodes: ${Array.from(t || '').map(c => c.charCodeAt(0)).join(',')})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTopic();
