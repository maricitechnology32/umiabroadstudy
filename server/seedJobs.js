const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const User = require('./models/User');

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

const jobsData = [
    {
        title: 'Senior Backend Engineer',
        department: 'Engineering',
        location: 'Tokyo, Japan',
        jobType: 'full-time',
        salaryRange: { min: 8000000, max: 12000000, currency: 'JPY' },
        description: '<p>We are looking for an experienced Backend Engineer to join our team and help build scalable visa application processing systems.</p><p><strong>What you\'ll do:</strong></p > <ul><li>Design and implement robust backend APIs</li><li>Work with MongoDB and Node.js</li><li>Optimize database queries and performance</li></ul>',
        requirements: [
            '5+ years of backend development experience',
            'Expert knowledge of Node.js and Express',
            'Strong understanding of MongoDB',
            'Experience with microservices architecture'
        ],
        qualifications: [
            'Bachelor\'s degree in Computer Science or related field',
            'Excellent problem-solving skills',
            'Good communication skills in English and Japanese'
        ],
        responsibilities: [
            'Develop and maintain backend services',
            'Collaborate with frontend team',
            'Participate in code reviews',
            'Mentor junior developers'
        ],
        benefits: [
            'Competitive salary',
            'Health insurance',
            'Visa sponsorship',
            'Flexible work hours',
            'Remote work options'
        ],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
    },
    {
        title: 'Frontend Developer',
        department: 'Engineering',
        location: 'Tokyo, Japan',
        jobType: 'full-time',
        salaryRange: { min: 6000000, max: 9000000, currency: 'JPY' },
        description: '<p>Join our team to create beautiful and intuitive user interfaces for visa applications.</p>',
        requirements: [
            '3+ years of React experience',
            'Strong CSS and responsive design skills',
            'Experience with Redux'
        ],
        qualifications: [
            'Portfolio of previous work',
            'Understanding of UX principles'
        ],
        responsibilities: [
            'Build responsive web applications',
            'Collaborate with designers',
            'Optimize application performance'
        ],
        benefits: [
            'Modern tech stack',
            'Learning budget',
            'Team events'
        ],
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'active'
    },
    {
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Osaka, Japan',
        jobType: 'full-time',
        salaryRange: { min: 7000000, max: 10000000, currency: 'JPY' },
        description: '<p>Lead our marketing efforts to help international students discover our visa services.</p>',
        requirements: [
            '5+ years in B2C marketing',
            'Digital marketing expertise',
            'Data-driven approach'
        ],
        qualifications: [
            'Marketing degree or equivalent',
            'Bilingual (English/Japanese preferred)'
        ],
        responsibilities: [
            'Develop marketing strategies',
            'Manage marketing budget',
            'Analyze campaign performance'
        ],
        benefits: [
            'Performance bonuses',
            'Career growth opportunities',
            'International team'
        ],
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'active'
    },
    {
        title: 'Customer Support Specialist',
        department: 'Customer Support',
        location: 'Remote',
        jobType: 'full-time',
        salaryRange: { min: 4000000, max: 6000000, currency: 'JPY' },
        description: '<p>Help students navigate their visa application journey with exceptional support.</p>',
        requirements: [
            '2+ years in customer support',
            'Excellent communication skills',
            'Problem-solving mindset'
        ],
        qualifications: [
            'Experience with support tools',
            'Empathy and patience'
        ],
        responsibilities: [
            'Respond to customer inquiries',
            'Resolve issues promptly',
            'Document solutions'
        ],
        benefits: [
            'Remote work',
            'Flexible schedule',
            'Training provided'
        ],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
    },
    {
        title: 'UX/UI Designer',
        department: 'Design',
        location: 'Tokyo, Japan',
        jobType: 'contract',
        salaryRange: { min: 5000000, max: 8000000, currency: 'JPY' },
        description: '<p>Design intuitive experiences for our visa application platform.</p>',
        requirements: [
            '4+ years of UX/UI design',
            'Proficiency in Figma',
            'Portfolio required'
        ],
        qualifications: [
            'Design degree or equivalent',
            'User research experience'
        ],
        responsibilities: [
            'Create wireframes and prototypes',
            'Conduct user testing',
            'Maintain design system'
        ],
        benefits: [
            'Creative freedom',
            'Latest design tools',
            'Collaborative environment'
        ],
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active'
    }
];

const seedJobs = async () => {
    try {
        await connectDB();

        // Delete existing jobs
        await Job.deleteMany({});
        console.log('Existing jobs deleted');

        // Find a super admin user to use as postedBy, or fallback to any user
        let admin = await User.findOne({ role: 'super_admin' });

        if (!admin) {
            console.log('No super_admin found, trying to find any user...');
            admin = await User.findOne({});
        }

        if (!admin) {
            console.log('No users found. Creating a dummy admin...');
            // Create a dummy user
            admin = await User.create({
                name: 'Job Poster',
                email: 'jobs@example.com',
                password: 'password123',
                role: 'super_admin'
            });
        }

        // Add postedBy to all jobs
        const jobsWithAdmin = jobsData.map(job => ({
            ...job,
            postedBy: admin._id
        }));

        console.log('Inserting new jobs...');
        let successCount = 0;
        for (const job of jobsWithAdmin) {
            try {
                const createdJob = await Job.create(job);
                console.log(`- Created: ${createdJob.title}`);
                successCount++;
            } catch (err) {
                console.error(`- Failed to create: ${job.title}`);
                console.error(`  Error: ${err.message}`);
            }
        }
        console.log(`${successCount} / ${jobsWithAdmin.length} jobs created.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding jobs:', error);
        console.error(error.stack);
        process.exit(1);
    }
};

seedJobs();
