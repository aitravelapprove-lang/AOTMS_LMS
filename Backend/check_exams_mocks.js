const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function checkExamsMocks() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected');

        const topic = "Emded System";

        const Exam = mongoose.model('Exam', new mongoose.Schema({ title: String }), 'exams');
        const MockPaper = mongoose.model('MockPaper', new mongoose.Schema({ title: String }), 'mockpapers');

        const exams = await Exam.find({ title: new RegExp(`^${topic}$`, 'i') }).lean();
        const mocks = await MockPaper.find({ title: new RegExp(`^${topic}$`, 'i') }).lean();

        console.log(`Exams matching "${topic}":`, exams.length);
        exams.forEach(e => console.log(`- Exam: ID ${e._id}, Title: "${e.title}"`));
        
        console.log(`Mocks matching "${topic}":`, mocks.length);
        mocks.forEach(m => console.log(`- Mock: ID ${m._id}, Title: "${m.title}"`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkExamsMocks();
