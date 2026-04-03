require('dotenv').config();
const mongoose = require('mongoose');
const { User, Profile } = require('./models/User');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'jayaveergemini@gmail.com' });
    console.log("User found:", user ? user._id : 'No');
    
    if (user) {
        let profile = await Profile.findOne({ user_id: user._id }).lean();
        console.log("Profile BEFORE:", profile);
        
        try {
            await Profile.findOneAndUpdate(
                { user_id: user._id },
                { $set: { github_url: 'https://test.com/before' } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        } catch(e) {
            console.error("Error upserting:", e.message);
        }
        
        profile = await Profile.findOne({ user_id: user._id }).lean();
        console.log("Profile AFTER:", profile);
    }
    process.exit(0);
}
debug();
