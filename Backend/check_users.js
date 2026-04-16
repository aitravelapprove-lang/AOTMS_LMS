const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function checkUsers() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected');

        const User = mongoose.model('User', new mongoose.Schema({}), 'users');

        const ids = [
            '69ddf86b00b07aa5147f5a56',
            '69de4d4c00b07aa5147f68d9',
            '69dddbb3e1240301f64fcea9'
        ];

        for (const id of ids) {
            const user = await User.findById(id).lean();
            console.log(`ID ${id}: ${user ? 'FOUND (' + user.full_name + ')' : 'NOT FOUND'}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
