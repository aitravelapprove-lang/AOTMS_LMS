const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const courseId1 = "69bc407709897ee007434a39";
    const courseId2 = "69bc407709897ee007434a3a";
    
    console.log(`Checking Enrollments for both IDs:`);
    const e1 = await db.collection('enrollments').findOne({ course_id: new mongoose.Types.ObjectId(courseId1) });
    const e2 = await db.collection('enrollments').findOne({ course_id: new mongoose.Types.ObjectId(courseId2) });
    
    console.log(`- Enrollment for ${courseId1}: ${e1 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`- Enrollment for ${courseId2}: ${e2 ? 'FOUND' : 'NOT FOUND'}`);

    const v1 = await db.collection('videos').countDocuments({ course_id: new mongoose.Types.ObjectId(courseId1) });
    const v2 = await db.collection('videos').countDocuments({ course_id: new mongoose.Types.ObjectId(courseId2) });
    console.log(`- Videos for ${courseId1}: ${v1}`);
    console.log(`- Videos for ${courseId2}: ${v2}`);

    await mongoose.connection.close();
}
debug().catch(console.error);
