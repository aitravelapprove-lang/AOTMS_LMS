const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Adjusted path for Backend/ CWD

const { Batch, StudentBatch } = require('../models/Batch');
const { Course, Enrollment } = require('../models/Course');
const { User, Profile, UserRole } = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function runDemo() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        // 1. Find or Create a Sample Student
        let student = await User.findOne({ email: 'demo_student@aotms.in' });
        if (!student) {
            student = new User({
                full_name: 'Demo Student',
                email: 'demo_student@aotms.in',
                password_hash: 'hashed_pw_123', // Demo hash
                role: 'student'
            });
            await student.save();
            
            // Create Role and Profile
            await UserRole.create({ user_id: student._id, role: 'student' });
            await Profile.create({ 
                user_id: student._id, 
                full_name: 'Demo Student', 
                email: 'demo_student@aotms.in',
                approval_status: 'approved'
            });
            console.log('Created Demo Student, Profile and Role');
        }

        // 2. Find or Create a Sample Course
        let course = await Course.findOne({ slug: 'demo-full-stack' });
        if (!course) {
            course = new Course({
                title: 'Demo Full Stack Mastery',
                slug: 'demo-full-stack',
                category: 'Development',
                price: 5000,
                is_active: true
            });
            await course.save();
            console.log('Created Demo Course');
        }

        // 3. Create a Managed Batch with Time Slots
        let batch = await Batch.findOne({ course_id: course._id, batch_type: 'all', batch_name: 'Summer Bootcamp 2026' });
        if (batch) await batch.deleteOne(); // Refresh for demo

        batch = new Batch({
            course_id: course._id,
            batch_name: 'Summer Bootcamp 2026',
            batch_type: 'all',
            instructor_id: student._id, // Just for demo
            start_date: new Date(),
            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            batches: [
                {
                    batch_type: 'morning',
                    start_time: '08:00',
                    end_time: '10:00'
                },
                {
                    batch_type: 'evening',
                    start_time: '17:00',
                    end_time: '19:00'
                }
            ]
        });
        await batch.save();
        console.log('Created Multi-Slot Batch:', batch.batch_name);

        // 4. Create an Enrollment Request with a specific slot (Morning)
        const selectedSubBatch = batch.batches[0]; // Morning
        
        // Remove existing enrollment if any
        await Enrollment.deleteOne({ user_id: student._id, course_id: course._id });

        const enrollment = new Enrollment({
            user_id: student._id,
            course_id: course._id,
            status: 'pending',
            final_price: 5000,
            requested_batch_id: selectedSubBatch._id, // Pointing to the sub-batch ID
            requested_time_slot: `${selectedSubBatch.start_time} - ${selectedSubBatch.end_time}`,
            requested_batch_type: 'morning'
        });
        await enrollment.save();
        console.log('Created Enrollment Request for MORNING slot (08:00 - 10:00)');

        console.log('\n--- DEMO READY ---');
        console.log('1. Go to Enrollments Hub in Admin Panel');
        console.log(`2. Find student "${student.full_name}" request for "${course.title}"`);
        console.log(`3. Notice the time slot: "${enrollment.requested_time_slot}"`);
        console.log('4. Click "Approve"');
        console.log('5. The system will automatically assign the student to the Morning slot in Student Batches!');
        
        process.exit(0);
    } catch (err) {
        console.error('Demo Error:', err);
        process.exit(1);
    }
}

runDemo();
