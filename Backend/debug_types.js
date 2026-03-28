const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const VideoRaw = db.collection('videos');

    const courseIdStr = "69bc407709897ee007434a39";
    
    console.log(`Searching for videos with course_id: ${courseIdStr} (String)`);
    const countStr = await VideoRaw.countDocuments({ course_id: courseIdStr });
    console.log(`Count (String): ${countStr}`);

    console.log(`Searching for videos with course_id: (ObjectId)`);
    const countObj = await VideoRaw.countDocuments({ course_id: new mongoose.Types.ObjectId(courseIdStr) });
    console.log(`Count (ObjectId): ${countObj}`);

    await mongoose.connection.close();
}
debug().catch(console.error);
