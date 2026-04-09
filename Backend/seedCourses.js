const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { Course } = require('./models/Course');

async function seedCourses() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        const jsonPath = path.join(__dirname, '..', 'Aotms.courses.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const coursesData = JSON.parse(rawData);

        console.log(`Found ${coursesData.length} courses to import.`);

        for (const data of coursesData) {
            const course = {
                title: data.title,
                slug: data.slug,
                category: data.category,
                thumbnail_url: data.image,
                duration: data.duration,
                level: data.level,
                price: parseInt(data.price.replace(/[^0-9]/g, '')) || 0,
                original_price: parseInt(data.originalPrice.replace(/[^0-9]/g, '')) || 0,
                rating: data.rating,
                theme_color: data.themeColor,
                status: 'published',
                is_active: true
            };

            // Use slug as the unique identifier for upserting
            await Course.findOneAndUpdate(
                { slug: course.slug },
                course,
                { upsert: true, new: true }
            );
            console.log(`Upserted course: ${course.title}`);
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding courses:', error);
        process.exit(1);
    }
}

seedCourses();
