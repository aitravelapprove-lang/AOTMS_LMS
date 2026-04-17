const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function findInConfig() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const configs = await mongoose.connection.db.collection('mocktestconfigs').find({}).toArray();
        console.log('Mock Test Configs:', configs.map(c => ({ id: c._id, title: c.title })));

        const targetId = '69e28312e40a716aafdd7a5f';
        const match = configs.find(c => c._id.toString() === targetId);
        
        if (match) {
            console.log('Match found in mocktestconfigs! Updating...');
            const newDate = new Date('2026-04-17T19:05:00.000Z');
            await mongoose.connection.db.collection('mocktestconfigs').updateOne(
                { _id: match._id },
                { $set: { scheduled_date: newDate } }
            );
            console.log('Update successful.');
        } else {
            console.log('ID not found in mocktestconfigs.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

findInConfig();
