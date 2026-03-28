const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const userId = new mongoose.Types.ObjectId("69bc3fee4ad1dcfab384f509");
    const courseId = new mongoose.Types.ObjectId("69bc407709897ee007434a39");

    const vp = await db.collection('videoprogresses').find({ user_id: userId, course_id: courseId }).toArray();
    console.log(`VideoProgress for ${userId} on ${courseId}:`, JSON.stringify(vp, null, 2));

    const e = await db.collection('enrollments').findOne({ user_id: userId, course_id: courseId });
    console.log(`Enrollment for ${userId} on ${courseId}:`, JSON.stringify(e, null, 2));

    await mongoose.connection.close();
}
debug().catch(console.error);
