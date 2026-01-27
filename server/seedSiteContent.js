const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SiteContent = require('./models/SiteContent');

dotenv.config();

const seedSiteContent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const content = {
            hero: {
                title: "The Ultimate Visa Solution for Nepal's Consultancies.",
                subtitle: "Automate your COE documents, track 1000+ students, and let your candidates practice with our AI Immigration Officer. Trusted by top agencies in Kathmandu.",
                badgeText: "New: Version 2.0 with AI Mock Interviews",
                ctaPrimary: { text: "Start Free Trial", link: "/register" },
                ctaSecondary: { text: "View Success Stories", link: "/#testimonials" }
            },
            features: [
                {
                    title: "One-Click COE Generation",
                    description: "Generate error-free COE application forms for Immigration Bureau of Japan in seconds. No more manual typing.",
                    icon: "FileText"
                },
                {
                    title: "Student CRM Dashboard",
                    description: "Track every student from 'Inquiry' to 'Visa Granted'. Manage documents, status, and payments in one place.",
                    icon: "LayoutDashboard"
                },
                {
                    title: "100% Data Accuracy",
                    description: "Our system validates student data against Japanese immigration rules before you print. Reduce rejection rates.",
                    icon: "ShieldCheck"
                }
            ],
            stats: [
                { label: "Consultancies in Nepal", value: "50+" },
                { label: "Applications Processed", value: "12,000+" },
                { label: "Visa Success Rate", value: "98.5%" },
                { label: "COE Granted", value: "5000+" }
            ],
            testimonials: [
                {
                    name: "Rajesh Shrestha",
                    role: "CEO, Fuji Education (Kathmandu)",
                    quote: "JapanVisa.ai has completely transformed how we work. We used to spend hours on one COE. Now it takes 5 minutes.",
                    image: "https://randomuser.me/api/portraits/men/32.jpg"
                },
                {
                    name: "Sita Gurung",
                    role: "Senior Counselor, Sakura International",
                    quote: "The AI Interview practice is a game changer. Our students are so much more confident during the actual embassy interview.",
                    image: "https://randomuser.me/api/portraits/women/44.jpg"
                },
                {
                    name: "Amit Sharma",
                    role: "Director, Global Reach Nepal",
                    quote: "Finally, a software built specifically for the Japanese education market. Highly recommended.",
                    image: "https://randomuser.me/api/portraits/men/86.jpg"
                }
            ],
            aiSection: {
                title: "Your Students' Personal AI Sensei.",
                description: "Don't let your students fail at the interview stage. Our AI simulates a strict Immigration Officer to prepare them for the toughest questions.",
                features: [
                    "Real Japanese voice interactions",
                    "Feedback on grammar and politeness",
                    "Simulates Natita Airport scenarios"
                ]
            },
            seo: {
                title: "JapanVisa.ai - #1 SaaS for Education Consultancies in Nepal",
                description: "Automate COE applications and train students with AI."
            }
        };

        // Upsert the singleton content
        const count = await SiteContent.countDocuments();
        if (count === 0) {
            await SiteContent.create(content);
            console.log('Site Content Created!');
        } else {
            const first = await SiteContent.findOne();
            await SiteContent.findByIdAndUpdate(first._id, content, { new: true });
            console.log('Site Content Updated!');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding site content:', error);
        process.exit(1);
    }
};

seedSiteContent();
