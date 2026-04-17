const mongoose = require('mongoose');
const { Video } = require('../models/Course');
const { StudentBatch, Batch } = require('../models/Batch');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms');
        
        const userId = '69de4d4c00b07aa5147f68d9';
        const courseId = '69ddd29fab5aa195f3870e62';

        const studentBatch = await StudentBatch.findOne({ 
            student_id: new mongoose.Types.ObjectId(userId), 
            course_id: new mongoose.Types.ObjectId(courseId) 
        }).lean();

        if (!studentBatch) {
            console.log('NO STUDENT BATCH FOUND');
            process.exit(0);
        }

        const batchIds = [studentBatch.batch_id];
        if (studentBatch.assigned_session && studentBatch.assigned_session !== 'all') {
            const parentBatch = await Batch.findById(studentBatch.batch_id).lean();
            if (parentBatch && parentBatch.batches) {
                const sub = parentBatch.batches.find(b => b.batch_type.toLowerCase() === studentBatch.assigned_session.toLowerCase());
                if (sub && sub._id) {
                    batchIds.push(sub._id);
                }
            }
        }

        const normalizedIds = batchIds.filter(id => id && mongoose.Types.ObjectId.isValid(id.toString())).map(id => new mongoose.Types.ObjectId(id.toString()));

        const globalFilter = [
            { allowed_batches: { $exists: false } },
            { allowed_batches: null },
            { allowed_batches: { $size: 0 } }
        ];

        const filter = {
            course_id: new mongoose.Types.ObjectId(courseId),
            $or: [
                ...globalFilter,
                { allowed_batches: { $in: normalizedIds } }
            ]
        };

        console.log('Filter used:', JSON.stringify(filter, null, 2));
        const videos = await Video.find(filter).lean();
        console.log('Videos found:', videos.length);
        console.log(JSON.stringify(videos.map(v => ({id: v._id, title: v.title, allowed: v.allowed_batches})), null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
