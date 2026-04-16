const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function finalAudit() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        const topic = "Emded System";
        const topicRegex = new RegExp(`^${topic}$`, 'i');

        // 1. Get IDs of Exams/Mocks with this title
        const exams = await db.collection('exam_schedulings').find({ title: topicRegex }).toArray();
        const mocks = await db.collection('mockpapers').find({ title: topicRegex }).toArray();
        
        const examIds = exams.map(e => e._id);
        const mockIds = mocks.map(m => m._id);

        console.log(`Matching Exams: ${exams.length}, Matching Mocks: ${mocks.length}`);

        // 2. Count distinct students in StudentExamAccess
        const accessRecords = await db.collection('studentexamaccesses').find({ 
            $or: [
                { question_bank_topic: topicRegex },
                { exam_id: { $in: examIds } },
                { mock_paper_id: { $in: mockIds } }
            ]
        }).toArray();

        const uniqueStudentIds = new Set(accessRecords.map(r => r.student_id.toString()));
        
        console.log(`Total Unique Students with Explicit Access: ${uniqueStudentIds.size}`);
        
        // 3. Count students with Implicit Access (Courses)
        const qbs = await db.collection('questionbanks').find({ 
            topic: topicRegex, 
            course_id: { $ne: null } 
        }).toArray();
        const courseIds = qbs.map(q => q.course_id);

        const enrollments = await db.collection('enrollments').find({
            course_id: { $in: courseIds },
            status: 'active'
        }).toArray();

        const courseStudentIds = new Set(enrollments.map(e => e.user_id.toString()));
        console.log(`Total Unique Students with Course-based Access: ${courseStudentIds.size}`);

        // 4. Combined total
        const allAccessIds = new Set([...uniqueStudentIds, ...courseStudentIds]);
        console.log(`GRAND TOTAL Students with portal access to "${topic}": ${allAccessIds.size}`);
        
        console.log('--- Explicit Grant List ---');
        for(const id of uniqueStudentIds) {
            const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(id) });
            console.log(`- ${user ? user.full_name : id} (Direct Grant)`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

finalAudit();
