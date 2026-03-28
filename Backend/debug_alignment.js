const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const uniqueCourseIds = await db.collection('videos').distinct('course_id');
    console.log(`Unique Course IDs in videos collection:`, uniqueCourseIds);

    const enrollmentCourseIds = await db.collection('enrollments').distinct('course_id');
    console.log(`Unique Course IDs in enrollments collection:`, enrollmentCourseIds);

    const intersection = uniqueCourseIds.filter(id => enrollmentCourseIds.some(eid => eid.equals(id)));
    console.log(`Intersection (Courses with both videos and enrollments):`, intersection);

    await mongoose.connection.close();
}
debug().catch(console.error);
