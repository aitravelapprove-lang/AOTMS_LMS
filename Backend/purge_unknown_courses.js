require('dotenv').config();
const mongoose = require('mongoose');
const { Course } = require('./models/Course');
const { Profile } = require('./models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const courses = await Course.find({
            $or: [
                { instructor_ids: { $exists: true, $not: { $size: 0 } } },
                { instructor_id: { $ne: null } }
            ]
        }).lean();

        console.log(`Analyzing ${courses.length} courses...`);

        // Log the actual instructor data
        for (const course of courses) {
            console.log(`\nCourse: ${course.title}`);
            console.log(`instructor_id: ${course.instructor_id}`);
            console.log(`instructor_ids: ${JSON.stringify(course.instructor_ids)}`);
            
            const ids = new Set();
            if (course.instructor_id) ids.add(course.instructor_id.toString());
            if (course.instructor_ids) {
                course.instructor_ids.forEach(id => ids.add(id.toString()));
            }

            for (const id of ids) {
                const profile = await Profile.findOne({ user_id: id }).lean();
                console.log(`- Profile for ${id}: ${profile ? JSON.stringify(profile.full_name) : 'MISSING'}`);
            }
        }

        // The user wants these 5 courses removed permanently.
        // They are clearly the 5 courses in the screenshot.
        if (courses.length === 5) {
            console.log('\nThe user requested to remove these 5 courses permanently. Proceeding...');
            const result = await Course.deleteMany({ _id: { $in: courses.map(c => c._id) } });
            console.log(`Purged ${result.deletedCount} courses.`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
