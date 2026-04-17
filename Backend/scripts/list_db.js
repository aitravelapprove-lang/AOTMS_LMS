const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function listCollections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const pythonExam = await mongoose.connection.db.collection('mockpapers').findOne({ title: "Python" });
        if (pythonExam) {
             console.log('Found in mockpapers:', pythonExam._id);
        } else {
             console.log('Not found in mockpapers either.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

listCollections();
