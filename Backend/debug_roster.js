const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }), 'enrollments');
        const StudentBatch = mongoose.model('StudentBatch', new mongoose.Schema({}, { strict: false }), 'studentbatches');
        
        const courseId = '69ddd29fab5aa195f3870e62'; // From user screenshot
        
        const enrollments = await Enrollment.find({ 
            $or: [
                { course_id: courseId },
                { course_id: new mongoose.Types.ObjectId(courseId) }
            ]
        });
        
        console.log(`Found ${enrollments.length} enrollments for course ${courseId}`);
        enrollments.forEach(e => console.log(`- User: ${e.user_id}, Status: ${e.status}`));

        const assignments = await StudentBatch.find({
            $or: [
                { course_id: courseId },
                { course_id: new mongoose.Types.ObjectId(courseId) }
            ]
        });
        console.log(`Found ${assignments.length} batch assignments for course ${courseId}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
