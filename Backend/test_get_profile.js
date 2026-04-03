require('dotenv').config();
const mongoose = require('mongoose');
const { User, Profile } = require('./models/User');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'jayaveergemini@gmail.com' });
    console.log("User id:", user._id);
    const p = await Profile.findOne({ user_id: user._id });
    console.log(p);
    process.exit(0);
}
debug();
