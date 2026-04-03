const mongoose = require('mongoose');
require('dotenv').config();
const { Profile, User } = require('./models/User');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ email: 'jayaveergemini@gmail.com' }).lean();
    const profiles = await Profile.find({ user_id: { $in: users.map(u => u._id) } }).lean();
    
    // writing synchronously
    const fs = require('fs');
    fs.writeFileSync('dump.json', JSON.stringify({ users, profiles }, null, 2), 'utf8');
    
    process.exit(0);
}
debug();
