const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function listAllMocks() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected');

        const MockPaper = mongoose.model('MockPaper', new mongoose.Schema({ title: String }), 'mockpapers');
        const mocks = await MockPaper.find({}).lean();
        
        console.log('All MockPapers:');
        mocks.forEach(m => console.log(`- ID: ${m._id}, Title: "${m.title}"`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAllMocks();
