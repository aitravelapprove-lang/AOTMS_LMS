
const mongoose = require('mongoose');
require('dotenv').config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
        const { User, UserRole } = require('./models/User');
        
        const users = await User.find({}, 'email').limit(10);
        console.log('Top 10 users:');
        users.forEach(u => console.log(u.email));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
