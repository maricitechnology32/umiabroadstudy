const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AboutUs = require('./models/AboutUs');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const aboutUsData = {
    title: "Your Trusted Partner for Japan Study Visa Success",
    description: "We empower students worldwide to achieve their dreams of studying in Japan through expert guidance, streamlined processes, and personalized support at every step of their visa journey.",
    mission: "To simplify and democratize the Japan study visa application process, making quality education in Japan accessible to deserving students globally through innovative technology and expert consultation.",
    vision: "To become the world's most trusted and comprehensive platform for Japan study visa applications, helping thousands of students each year realize their academic aspirations in the Land of the Rising Sun.",
    values: [
        {
            title: "Excellence",
            description: "We maintain the highest standards in every service we provide, ensuring accuracy, professionalism, and success for our students.",
            icon: "🎯"
        },
        {
            title: "Transparency",
            description: "We believe in clear communication and honest guidance throughout the entire visa application process.",
            icon: "💎"
        },
        {
            title: "Innovation",
            description: "We leverage cutting-edge technology to streamline processes and provide the best user experience for students and consultancies.",
            icon: "🚀"
        },
        {
            title: "Student-First",
            description: "Every decision we make prioritizes the success and well-being of the students we serve.",
            icon: "🎓"
        },
        {
            title: "Integrity",
            description: "We operate with unwavering honesty and ethical standards in all our interactions and practices.",
            icon: "⚖️"
        },
        {
            title: "Collaboration",
            description: "We work closely with universities, consultancies, and students to create a supportive ecosystem for success.",
            icon: "🤝"
        }
    ],
    teamMembers: [
        {
            name: "Hiroshi Tanaka",
            role: "Founder & CEO",
            bio: "Former immigration consultant with 15+ years of experience in Japan study visas. Passionate about using technology to help students achieve their dreams.",
            imageUrl: "",
            linkedin: "",
            email: "hiroshi@example.com"
        },
        {
            name: "Sakura Yamamoto",
            role: "Chief Operations Officer",
            bio: "Expert in streamlining processes and ensuring exceptional service delivery. 10+ years in international education consulting.",
            imageUrl: "",
            linkedin: "",
            email: "sakura@example.com"
        },
        {
            name: "Kenji Sato",
            role: "Head of Technology",
            bio: "Full-stack developer specializing in SaaS platforms. Committed to building intuitive, powerful tools for visa processing.",
            imageUrl: "",
            linkedin: "",
            email: "kenji@example.com"
        },
        {
            name: "Yuki Nakamura",
            role: "Student Success Manager",
            bio: "Dedicated to ensuring every student has a smooth visa application experience. Former international student in Japan.",
            imageUrl: "",
            linkedin: "",
            email: "yuki@example.com"
        },
        {
            name: "Ravi Sharma",
            role: "Partnership Manager",
            bio: "Building bridges between consultancies, universities, and students across Asia and beyond.",
            imageUrl: "",
            linkedin: "",
            email: "ravi@example.com"
        },
        {
            name: "Emily Chen",
            role: "Compliance Specialist",
            bio: "Ensures all applications meet Japanese immigration requirements. Expert in documentation and legal compliance.",
            imageUrl: "",
            linkedin: "",
            email: "emily@example.com"
        }
    ],
    stats: [
        {
            label: "Students Helped",
            value: "5,000+",
            icon: "👥"
        },
        {
            label: "Success Rate",
            value: "98%",
            icon: "✅"
        },
        {
            label: "Partner Consultancies",
            value: "150+",
            icon: "🏢"
        },
        {
            label: "Countries Served",
            value: "45+",
            icon: "🌍"
        }
    ],
    isActive: true
};

const seedAboutUs = async () => {
    try {
        await connectDB();

        // Delete existing About Us content
        await AboutUs.deleteMany({});
        console.log('Existing About Us content deleted');

        // Create new About Us content
        const aboutUs = await AboutUs.create(aboutUsData);
        console.log('About Us content created successfully!');
        console.log('Title:', aboutUs.title);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding About Us:', error);
        process.exit(1);
    }
};

seedAboutUs();
