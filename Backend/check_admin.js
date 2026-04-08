
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const { User, UserRole } = require('./models/User');
        
        const user = await User.findOne({ email: 'ramanadhamjayaveer@mictech.edu.in' });
        if (!user) {
            console.log('User not found');
            return;
        }
        
        const role = await UserRole.findOne({ user_id: user._id });
        console.log('User ID:', user._id);
        console.log('Role:', role ? role.role : 'No role found');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
