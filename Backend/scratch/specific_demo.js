const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Adjusted path for Backend/ CWD

const { Batch } = require('../models/Batch');
const { Course } = require('../models/Course');
const { User, Profile, UserRole } = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function runSpecificDemo() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const courseId = '69ddd29fab5aa195f3870e67';
        const instructorId = '69df8a08017b517a325e6675';

        // 1. Ensure Instructor exists
        let instructor = await User.findById(instructorId);
        if (!instructor) {
            instructor = new User({
                _id: new mongoose.Types.ObjectId(instructorId),
                full_name: 'Demo Instructor',
                email: 'instructor_demo@aotms.in',
                password_hash: 'hashed_pw_instructor',
                role: 'instructor'
            });
            await instructor.save();
            await UserRole.create({ user_id: instructor._id, role: 'instructor' });
            await Profile.create({ 
                user_id: instructor._id, 
                full_name: 'Demo Instructor', 
                email: 'instructor_demo@aotms.in',
                approval_status: 'approved'
            });
            console.log('Created Demo Instructor with ID:', instructorId);
        }

        // 2. Ensure Course exists
        let course = await Course.findById(courseId);
        if (!course) {
            course = new Course({
                _id: new mongoose.Types.ObjectId(courseId),
                title: 'Professional Skill Development',
                slug: 'pro-skill-dev',
                category: 'Corporate',
                price: 15000,
                instructor_ids: [instructor._id],
                is_active: true
            });
            await course.save();
            console.log('Created Demo Course with ID:', courseId);
        }

        // 3. Create the requested batches
        // Clean up previous demo batches for this course to avoid confusion
        await Batch.deleteMany({ course_id: courseId });

        const batch1 = new Batch({
            course_id: course._id,
            instructor_id: instructor._id,
            batch_name: 'Morning Batch (Slot A)',
            batch_type: 'morning',
            start_time: '09:00',
            end_time: '11:00',
            start_date: new Date(),
            end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        });

        const batch2 = new Batch({
            course_id: course._id,
            instructor_id: instructor._id,
            batch_name: 'Morning Batch (Slot B)',
            batch_type: 'morning',
            start_time: '11:15',
            end_time: '13:00',
            start_date: new Date(),
            end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        });

        await batch1.save();
        await batch2.save();

        console.log('\n--- SUCCESS ---');
        console.log(`Course Title: ${course.title}`);
        console.log(`Instructor: ${instructor.full_name}`);
        console.log('Batches Created in "batches" collection:');
        console.log(`1. ${batch1.batch_name} | ${batch1.start_time} - ${batch1.end_time}`);
        console.log(`2. ${batch2.batch_name} | ${batch2.start_time} - ${batch2.end_time}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Specific Demo Error:', err);
        process.exit(1);
    }
}

runSpecificDemo();
