const mongoose = require('mongoose');
require('dotenv').config();
const { Profile, User } = require('./models/User');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: 'jayaveergemini@gmail.com' });
    const profile = await Profile.findOne({ user_id: user._id });
    
    console.log("==> DB VALUE FOR JAYAVEER:");
    console.log("github:", profile.github_url);
    console.log("resume:", profile.resume_url);
    
    process.exit(0);
}
debug();
