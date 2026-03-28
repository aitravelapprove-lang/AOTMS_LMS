const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const videoSchema = new mongoose.Schema({
    course_id: mongoose.Schema.Types.ObjectId,
    title: String
});
const Video = mongoose.model('Video', videoSchema);

const courseSchema = new mongoose.Schema({
    title: String
});
const Course = mongoose.model('Course', courseSchema);

async function debug() {
    if (!MONGO_URI) {
        console.error('MONGO_URI not found in .env');
        return;
    }
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const totalVideos = await Video.countDocuments();
    console.log(`Total Videos in DB: ${totalVideos}`);

    const courses = await Course.find().limit(20).lean();
    console.log('\nLast 20 courses and their video counts:');
    for (const c of courses) {
        const vCount = await Video.countDocuments({ course_id: c._id });
        console.log(`- Course: ${c.title} (${c._id}), Videos: ${vCount}`);
    }

    await mongoose.connection.close();
}

debug().catch(console.error);
