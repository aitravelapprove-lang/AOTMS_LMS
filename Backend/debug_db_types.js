const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const vp = await db.collection('videoprogresses').findOne({});
    if (vp) {
        console.log('VideoProgress types:');
        console.log(`- user_id type: ${typeof vp.user_id} (${vp.user_id.constructor.name})`);
        console.log(`- course_id type: ${typeof vp.course_id} (${vp.course_id.constructor.name})`);
        console.log(`- video_id type: ${typeof vp.video_id}`);
    }

    const en = await db.collection('enrollments').findOne({ status: 'active' });
    if (en) {
        console.log('\nEnrollment types:');
        console.log(`- user_id type: ${typeof en.user_id} (${en.user_id.constructor.name})`);
        console.log(`- course_id type: ${typeof en.course_id} (${en.course_id.constructor.name})`);
    }

    await mongoose.connection.close();
}
debug().catch(console.error);
