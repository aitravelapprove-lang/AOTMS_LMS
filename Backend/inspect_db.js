const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Try to find ANY video record using raw driver
    const VideoRaw = db.collection('videos');
    const allVideos = await VideoRaw.find({}).limit(5).toArray();
    console.log('\nSample Raw Videos:', JSON.stringify(allVideos, null, 2));

    // Try course_videos (alternative name)
    const CourseVideosRaw = db.collection('course_videos');
    const allCourseVideos = await CourseVideosRaw.find({}).limit(5).toArray();
    console.log('\nSample Raw Course Videos:', JSON.stringify(allCourseVideos, null, 2));

    await mongoose.connection.close();
}
debug().catch(console.error);
