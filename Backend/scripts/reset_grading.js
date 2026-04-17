const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function resetGradingStatus() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const resultId = '69e2860d5191126fe8fba0e7';
        
        const result = await mongoose.connection.db.collection('examresults').updateOne(
            { _id: new mongoose.Types.ObjectId(resultId) },
            { 
                $set: { 
                    grading_status: 'pending',
                    // Also reset score to 0 to allow new grading
                    score: 0 
                } 
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Successfully reset Exam Result status to 'pending'. It should now be visible in the Instructor Panel.`);
        } else {
            console.log('No result found with that ID or it was already pending.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

resetGradingStatus();
