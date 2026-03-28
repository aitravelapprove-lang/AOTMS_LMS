const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const userId = new mongoose.Types.ObjectId("69bc3fee4ad1dcfab384f509");
    const courseId = new mongoose.Types.ObjectId("69bc407709897ee007434a39");

    const videos = await db.collection('videos').find({ course_id: courseId }).toArray();
    console.log(`Videos for Course:`, videos.map(v => v._id.toString()));

    const vp = await db.collection('videoprogresses').find({ user_id: userId, course_id: courseId }).toArray();
    console.log(`VideoProgress records:`, vp.map(v => ({ video_id: v.video_id, watched: v.watched_percentage })));

    await mongoose.connection.close();
}
debug().catch(console.error);
