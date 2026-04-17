const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function finalizeGrading() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const resultId = '69e2860d5191126fe8fba0e7';
        const questionId = '69e285535191126fe8fba00e';
        
        const result = await mongoose.connection.db.collection('examresults').updateOne(
            { _id: new mongoose.Types.ObjectId(resultId) },
            { 
                $set: { 
                    grading_status: 'graded',
                    score: 1,
                    percentage: 100,
                    subjective_grading: {
                        [questionId]: {
                            marks: 1,
                            feedback: "Excellent logic implementation. The code correctly handles edge cases using prefix sums."
                        }
                    }
                } 
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Successfully finalized grading. Student portal will now show 1/1 and "Graded".`);
        } else {
            console.log('No result found with that ID.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

finalizeGrading();
