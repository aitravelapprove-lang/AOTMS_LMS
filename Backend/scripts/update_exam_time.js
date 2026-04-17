const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function findAndUpdateExam() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Search by title since ID didn't match directly (might be String vs ObjectId mismatch in my script)
        const exam = await mongoose.connection.db.collection('exams').findOne({ title: "Python" });
        
        if (exam) {
            console.log('Found exam:', exam._id);
            const newScheduledDate = new Date('2026-04-17T19:05:00.000Z');

            await mongoose.connection.db.collection('exams').updateOne(
                { _id: exam._id },
                { 
                    $set: { 
                        scheduled_date: newScheduledDate,
                        status: 'active',
                        approval_status: 'approved'
                    } 
                }
            );
            console.log('Successfully updated Python Exam time to 12:35 AM IST.');
        } else {
            console.log('No exam with title "Python" found.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

findAndUpdateExam();
