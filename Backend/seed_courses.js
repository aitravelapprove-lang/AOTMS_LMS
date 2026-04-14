const mongoose = require('mongoose');
require('dotenv').config();
const { Course } = require('./models/Course');

const courses = [
    {
        title: "Mastering Full Stack Web Development",
        slug: "full-stack-web-development",
        description: "Become a professional full stack developer with MERN stack. Learn React, Node.js, Express, and MongoDB from scratch.",
        thumbnail_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
        category: "Web Development",
        price: 4999,
        original_price: 15000,
        level: "Beginner to Advanced",
        duration: "6 Months",
        status: "published",
        is_active: true,
        theme_color: "#0075CF",
        tags: ["React", "Node.js", "MongoDB", "Express", "MERN"]
    },
    {
        title: "Advanced Data Science & Machine Learning",
        slug: "data-science-machine-learning",
        description: "Master Python for Data Science. Learn supervised and unsupervised learning, neural networks, and deep learning.",
        thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
        category: "Data Science",
        price: 5999,
        original_price: 18000,
        level: "Intermediate",
        duration: "5 Months",
        status: "published",
        is_active: true,
        theme_color: "#FD5A1A",
        tags: ["Python", "Pandas", "Scikit-Learn", "Deep Learning"]
    },
    {
        title: "Cyber Security Professional Certificate",
        slug: "cyber-security-professional",
        description: "Learn ethical hacking, network security, and risk management. Protect systems from modern cyber threats.",
        thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
        category: "Cyber Security",
        price: 4499,
        original_price: 12000,
        level: "Intermediate",
        duration: "4 Months",
        status: "published",
        is_active: true,
        theme_color: "#6366F1",
        tags: ["Hacking", "Network", "Security", "Linux"]
    },
    {
        title: "Cloud Architecting on AWS & Azure",
        slug: "cloud-architecting-aws-azure",
        description: "Master the cloud with AWS and Azure. Learn to design, deploy, and manage scalable cloud infrastructures.",
        thumbnail_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
        category: "Cloud Computing",
        price: 5499,
        original_price: 16000,
        level: "Advanced",
        duration: "4 Months",
        status: "published",
        is_active: true,
        theme_color: "#0EA5E9",
        tags: ["AWS", "Azure", "Cloud", "DevOps"]
    },
    {
        title: "UI/UX Design Masterclass",
        slug: "ui-ux-design-masterclass",
        description: "Design stunning user interfaces and experience. Master Figma, Adobe XD, and design systems.",
        thumbnail_url: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=600",
        category: "Design",
        price: 3999,
        original_price: 10000,
        level: "Beginner",
        duration: "3 Months",
        status: "published",
        is_active: true,
        theme_color: "#EC4899",
        tags: ["Figma", "UI", "UX", "Product Design"]
    },
    {
        title: "Digital Marketing Strategy 2024",
        slug: "digital-marketing-strategy",
        description: "Grow any business with SEO, SEM, Social Media, and Content Marketing. Master modern marketing tools.",
        thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
        category: "Marketing",
        price: 2999,
        original_price: 8000,
        level: "Beginner",
        duration: "3 Months",
        status: "published",
        is_active: true,
        theme_color: "#F59E0B",
        tags: ["SEO", "SEM", "ADS", "SOCIAL MEDIA"]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Optional: Clear existing courses? 
        // No, let's just add new ones or update existing by slug
        for (const courseData of courses) {
            await Course.findOneAndUpdate(
                { slug: courseData.slug },
                courseData,
                { upsert: true, new: true }
            );
            console.log(`Synced course: ${courseData.title}`);
        }

        console.log('Seeding completed successfully');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await mongoose.connection.close();
    }
}

seed();
