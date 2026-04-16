const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    created_at: { type: Date }
}, { strict: false });

const ProfileSchema = new mongoose.Schema({
    created_at: { type: Date }
}, { strict: false });

const User = mongoose.model('User', UserSchema);
const Profile = mongoose.model('Profile', ProfileSchema);

async function forceUpdate() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Updating ${users.length} users...`);

        for (const user of users) {
             const dt = user.created_at || new Date();
             const registrationDate = dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
             const registrationTime = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

             await User.updateOne(
                 { _id: user._id },
                 { $set: { registration_date: registrationDate, registration_time: registrationTime } }
             );
        }

        const profiles = await Profile.find({});
        console.log(`Updating ${profiles.length} profiles...`);

        for (const profile of profiles) {
             const dt = profile.created_at || new Date();
             const registrationDate = dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
             const registrationTime = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

             await Profile.updateOne(
                 { _id: profile._id },
                 { $set: { registration_date: registrationDate, registration_time: registrationTime } }
             );
        }

        console.log('Force migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

forceUpdate();
