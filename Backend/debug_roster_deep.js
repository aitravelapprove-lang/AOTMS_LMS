const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const StudentBatch = mongoose.model('StudentBatch', new mongoose.Schema({}, { strict: false }), 'studentbatches');
        const Batch = mongoose.model('Batch', new mongoose.Schema({}, { strict: false }), 'batches');
        
        const courseId = '69ddd29fab5aa195f3870e62';
        
        const assignments = await StudentBatch.find({ 
            $or: [{ course_id: courseId }, { course_id: new mongoose.Types.ObjectId(courseId) }]
        });
        
        for (const a of assignments) {
            const batch = await Batch.findById(a.batch_id);
            console.log(`Student: ${a.student_id}`);
            console.log(` Batch: ${batch ? batch.batch_name : 'NOT FOUND'} (${batch ? batch.batch_type : 'N/A'})`);
            console.log(` Session: ${a.assigned_session}`);
            console.log('---');
        }

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

checkData();
