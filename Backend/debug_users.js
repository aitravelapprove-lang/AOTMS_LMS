require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { User, Profile, UserRole } = require('./models/User');

const debugUsers = async () => {
    try {
        await connectDB();
        
        console.log('--- USERS LIST ---');
        const users = await User.find({}).lean();
        for (const user of users) {
            const profile = await Profile.findOne({ user_id: user._id }).lean();
            const roleDoc = await UserRole.findOne({ user_id: user._id }).lean();
            console.log(`Email: ${user.email}`);
            console.log(`Full Name: ${user.full_name}`);
            console.log(`Role: ${roleDoc ? roleDoc.role : 'N/A'}`);
            console.log(`Approval Status: ${profile ? profile.approval_status : 'N/A'}`);
            console.log(`ID: ${user._id}`);
            console.log('---');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

debugUsers();
