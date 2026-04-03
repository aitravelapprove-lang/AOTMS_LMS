const axios = require('axios');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User } = require('./models/User');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'jayaveergemini@gmail.com' });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret_key_change_me');
    
    try {
        const getRes = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("==> RAW HTTP RESPONSE DATA:");
        console.dir(getRes.data, { depth: null });
    } catch(err) {
        console.error(err.response ? err.response.data : err.message);
    }
    process.exit(0);
}
debug();
