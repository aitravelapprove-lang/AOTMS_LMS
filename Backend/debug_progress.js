const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://raman:aotms1234@cluster0.o73et.mongodb.net/LMS_Prod?retryWrites=true&w=majority&appName=Cluster0";

// Schemas
const enrollmentSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    course_id: mongoose.Schema.Types.ObjectId,
    progress_percentage: Number,
    status: String
});
const videoProgressSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    course_id: mongoose.Schema.Types.ObjectId,
    video_id: String,
    watched_percentage: Number
});
const videoSchema = new mongoose.Schema({
    course_id: mongoose.Schema.Types.ObjectId,
    title: String
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const VideoProgress = mongoose.model('VideoProgress', videoProgressSchema);
const Video = mongoose.model('Video', videoSchema);

async function debug() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const enrollments = await Enrollment.find({ status: 'active' }).limit(5);
    console.log('\nRecent Enrolled Courses with Progress:');
    for (const e of enrollments) {
        console.log(`- User: ${e.user_id}, Course: ${e.course_id}, Progress: ${e.progress_percentage}%`);
        
        const progressCount = await VideoProgress.countDocuments({ user_id: e.user_id, course_id: e.course_id });
        console.log(`  Count of Video Progress records: ${progressCount}`);
        
        const videosCount = await Video.countDocuments({ course_id: e.course_id });
        console.log(`  Total Videos in Course: ${videosCount}`);
        
        if (videosCount > 0) {
            const records = await VideoProgress.find({ user_id: e.user_id, course_id: e.course_id });
            const totalPct = records.reduce((acc, r) => acc + (r.watched_percentage || 0), 0);
            console.log(`  Calculated Progress should be: ${Math.round(totalPct / videosCount)}%`);
        }
    }

    await mongoose.connection.close();
}

debug().catch(console.error);
