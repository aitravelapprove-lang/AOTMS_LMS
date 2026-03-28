const mongoose = require('mongoose');
require('dotenv').config();

const Schema = mongoose.Schema;

// Define minimal schema for testing
const VideoSchema = new Schema({
    title: String,
    video_url: String
}, { collection: 'videos' });

const Video = mongoose.model('Video', VideoSchema);

async function checkVideos() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const videos = await Video.find({}).limit(5);
        console.log('Sample Videos:');
        videos.forEach(v => {
            console.log(`- Title: ${v.title}`);
            console.log(`  URL: ${v.video_url}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkVideos();
