require('dotenv').config();
const mongoose = require('mongoose');
const { Course } = require('./Backend/models/Course');
const { Profile } = require('./Backend/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');

        const courses = await Course.find({
            $or: [
                { instructor_ids: { $exists: true, $not: { $size: 0 } } },
                { instructor_id: { $ne: null } }
            ]
        }).lean();

        const instructorIds = [...new Set(courses.flatMap(c => c.instructor_ids || []).filter(id => id))];
        if (instructorIds.length === 0) {
            console.log('No instructors assigned to any courses.');
            process.exit(0);
        }

        const profiles = await Profile.find({ user_id: { $in: instructorIds } }).lean();
        const profileMap = profiles.reduce((acc, p) => {
            acc[p.user_id] = p;
            return acc;
        }, {});

        const unknownCourses = courses.filter(course => {
            const instructors = (course.instructor_ids || []);
            return instructors.every(id => !profileMap[id]);
        });

        console.log(`Found ${unknownCourses.length} unknown courses:`);
        unknownCourses.forEach(c => console.log(`- ${c.title} (${c._id})`));

        if (unknownCourses.length > 0) {
            console.log('Deleting them permanently...');
            const result = await Course.deleteMany({ _id: { $in: unknownCourses.map(c => c._id) } });
            console.log(`Deleted ${result.deletedCount} courses.`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
