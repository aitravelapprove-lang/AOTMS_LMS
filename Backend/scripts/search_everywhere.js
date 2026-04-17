const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function searchEverywhere() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        const targetId = '69e28312e40a716aafdd7a5f';
        const targetObjectId = new mongoose.Types.ObjectId(targetId);

        console.log('Searching for ID:', targetId);

        for (const col of collections) {
            const match = await mongoose.connection.db.collection(col.name).findOne({ _id: targetObjectId });
            if (match) {
                console.log(`FOUND in collection: ${col.name}`);
                console.log('Current Title:', match.title);
                
                const newDate = new Date('2026-04-17T19:05:00.000Z');
                await mongoose.connection.db.collection(col.name).updateOne(
                    { _id: targetObjectId },
                    { $set: { scheduled_date: newDate, status: 'active', approval_status: 'approved' } }
                );
                console.log('Successfully updated scheduled_date to 12:35 AM IST.');
                return;
            }
        }
        console.log('ID not found anywhere in the database.');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

searchEverywhere();
