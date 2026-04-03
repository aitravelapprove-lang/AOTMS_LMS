const mongoose = require('mongoose');
require('dotenv').config();
const { Profile } = require('./models/User');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const userIdStr = '69bc3fee4ad1dcfab384f509';
    const payload = {
      full_name: 'Jayaveer',
      avatar_url: '',
      github_url: 'https://github.com/jayaveerR?tab=repositories',
      resume_url: '/api/s3/public/resumes/69bc3fee4ad1dcfab384f509/1775216646382_Jayaveer-resume_.pdf'
    };
    
    console.log("Running findOneAndUpdate...");
    const updated = await Profile.findOneAndUpdate(
        { user_id: userIdStr },
        { $set: payload },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    console.log("Returned from DB:", updated.github_url ? updated.github_url : "NOT FOUND in returned object");
    
    const p = await Profile.findOne({ user_id: userIdStr });
    console.log("Actual DB Check:", p.github_url ? p.github_url : "NOT FOUND in DB lookup");
    
    process.exit(0);
}
debug();
