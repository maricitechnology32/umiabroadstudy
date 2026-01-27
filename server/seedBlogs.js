const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('./models/Blog');
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

// const blogPosts = [
//     {
//         title: "Top 10 Tips for Getting Your Japan Student Visa Approved",
//         excerpt: "Planning to study in Japan? Here are the essential tips you need to know to ensure your student visa application is successful.",
//         content: `<h2>Introduction</h2>
// <p>Getting a student visa for Japan can seem daunting, but with proper preparation, you can significantly increase your chances of approval. Here are the top 10 tips based on hundreds of successful applications.</p>

// <h3>1. Start Early</h3>
// <p>Begin your application process at least 6 months before your intended departure date. This gives you ample time to gather documents and handle any unexpected delays.</p>

// <h3>2. Choose the Right School</h3>
// <p>Make sure your chosen institution is recognized by the Japanese government and authorized to accept international students.</p>

// <h3>3. Financial Documentation is Key</h3>
// <p>Demonstrate sufficient financial resources to cover tuition and living expenses. Bank statements should show consistent balances over several months.</p>

// <h3>4. Write a Compelling Statement of Purpose</h3>
// <p>Clearly explain why you want to study in Japan, your career goals, and how the program aligns with your objectives.</p>

// <h3>5. Language Proficiency Matters</h3>
// <p>Obtain JLPT certification or demonstrate Japanese language proficiency through your school's placement tests.</p>

// <h2>Conclusion</h2>
// <p>Following these tips will put you on the right path to visa approval. Remember, preparation and attention to detail are crucial!</p>`,
//         category: 'Visa Tips',
//         tags: ['student visa', 'application tips', 'japan immigration'],
//         status: 'published',
//         publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
//         featuredImage: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=1600"
//     },
//     {
//         title: "Life as an International Student in Tokyo: A Complete Guide",
//         excerpt: "Everything you need to know about living, studying, and thriving as an international student in Japan's bustling capital city.",
//         content: `<h2>Welcome to Tokyo!</h2>
// <p>Tokyo is an incredible city for international students, offering a unique blend of traditional culture and cutting-edge technology.</p>

// <h3>Housing Options</h3>
// <p>From student dormitories to share houses and private apartments, Tokyo offers various accommodation options to suit different budgets and preferences.</p>

// <h3>Cost of Living</h3>
// <p>Budget approximately Rs100,000-150,000 per month for living expenses including rent, food, transportation, and entertainment.</p>

// <h3>Part-Time Work</h3>
// <p>International students can work up to 28 hours per week during semesters and 40 hours during vacations with proper permission.</p>

// <h3>Cultural Activities</h3>
// <p>Take advantage of Tokyo's numerous museums, temples, festivals, and cultural events to immerse yourself in Japanese culture.</p>`,
//         category: 'Student Life',
//         tags: ['tokyo', 'student life', 'international students'],
//         status: 'published',
//         publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
//         featuredImage: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=1600"
//     },
//     {
//         title: "Understanding the COE Application Process: Step by Step",
//         excerpt: "A detailed walkthrough of the Certificate of Eligibility application process for prospective students in Japan.",
//         content: `<h2>What is a COE?</h2>
// <p>The Certificate of Eligibility (COE) is a crucial document issued by the Japanese Immigration Bureau that pre-approves your visa application.</p>

// <h3>Step 1: School Application</h3>
// <p>First, apply to and get accepted by a Japanese educational institution that's authorized to accept international students.</p>

// <h3>Step 2: Document Preparation</h3>
// <p>Gather all required documents including academic transcripts, financial statements, passport copies, and photos.</p>

// <h3>Step 3: School Submits COE Application</h3>
// <p>Your school will submit the COE application to the Immigration Bureau on your behalf.</p>

// <h3>Step 4: Waiting Period</h3>
// <p>The processing time typically ranges from 1-3 months. Use this time to prepare for your move.</p>

// <h3>Step 5: Receive COE</h3>
// <p>Once approved, your school will send you the COE, which you'll use to apply for your visa at a Japanese embassy or consulate.</p>`,
//         category: 'Application Guide',
//         tags: ['COE', 'visa process', 'documentation'],
//         status: 'published',
//         publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
//         featuredImage: "https://images.unsplash.com/photo-1524419986249-348e8fa6ad4a?auto=format&fit=crop&q=80&w=1600"
//     },
//     {
//         title: "Success Story: From Nepal to Tokyo University",
//         excerpt: "Meet Raj, who successfully navigated the visa process and is now pursuing his dreams at one of Japan's top universities.",
//         content: `<h2>Meet Raj Kumar</h2>
// <p>Raj Kumar from Kathmandu, Nepal, is now a second-year engineering student at the prestigious Tokyo University.</p>

// <blockquote>
// <p>"The visa process seemed overwhelming at first, but with proper guidance and preparation, everything fell into place perfectly."</p>
// </blockquote>

// <h3>The Journey</h3>
// <p>Raj spent nearly a year preparing for his move to Japan, from studying Japanese to gathering financial documents and acing his university entrance exams.</p>

// <h3>Challenges Overcome</h3>
// <p>Language barrier, cultural adjustment, and homesickness were some initial challenges, but Raj found support through international student communities and university resources.</p>

// <h3>Advice for Future Students</h3>
// <ul>
// <li>Start learning Japanese as early as possible</li>
// <li>Research your university and program thoroughly</li>
// <li>Join student communities before arriving</li>
// <li>Be open to new experiences and cultural differences</li>
// </ul>`,
//         category: 'Success Stories',
//         tags: ['success story', 'student experience', 'tokyo university'],
//         status: 'published',
//         publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
//         featuredImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600"
//     },
//     {
//         title: "New Immigration Policies for 2025: What Students Need to Know",
//         excerpt: "Stay updated with the latest changes in Japan's immigration policies affecting international students in 2025.",
//         content: `<h2>2025 Policy Updates</h2>
// <p>The Japanese government has announced several important changes to its immigration policies for international students.</p>

// <h3>Extended Post-Graduation Work Period</h3>
// <p>Graduates can now stay in Japan for up to 2 years to seek employment, up from the previous 1-year limit.</p>

// <h3>Simplified Document Requirements</h3>
// <p>Certain document requirements have been streamlined to make the application process more efficient.</p>

// <h3>Digital Application System</h3>
// <p>A new online portal will launch in Q2 2025, allowing students to submit and track applications digitally.</p>

// <p><strong>Note:</strong> This is draft content for internal review. Will be published once policies are officially announced.</p>`,
//         category: 'News',
//         tags: ['immigration policy', '2025 updates', 'policy changes'],
//         status: 'draft', // This one is a draft
//         featuredImage: "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&q=80&w=1600"
//     }
// ];

const blogPosts = [
    {
        title: "Top 10 Tips for Getting Your Japan Student Visa Approved",
        excerpt: "Planning to study in Japan? Here are the essential tips you need to know to ensure your student visa application is successful.",
        content: `<h2>Introduction</h2>
<p>Getting a student visa for Japan can seem daunting, but with proper preparation, you can significantly increase your chances of approval. Here are the top 10 tips based on hundreds of successful applications.</p>

<h3>1. Start Early</h3>
<p>Begin your application process at least 6 months before your intended departure date. This gives you ample time to gather documents and handle any unexpected delays.</p>

<h3>2. Choose the Right School</h3>
<p>Make sure your chosen institution is recognized by the Japanese government and authorized to accept international students.</p>

<h3>3. Financial Documentation is Key</h3>
<p>Demonstrate sufficient financial resources to cover tuition and living expenses. Bank statements should show consistent balances over several months.</p>

<h3>4. Write a Compelling Statement of Purpose</h3>
<p>Clearly explain why you want to study in Japan, your career goals, and how the program aligns with your objectives.</p>

<h3>5. Language Proficiency Matters</h3>
<p>Obtain JLPT certification or demonstrate Japanese language proficiency through your school's placement tests.</p>

<h2>Conclusion</h2>
<p>Following these tips will put you on the right path to visa approval. Remember, preparation and attention to detail are crucial!</p>`,
        category: 'Visa Tips',
        tags: ['student visa', 'application tips', 'japan immigration'],
        status: 'published',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        featuredImage: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=1600"
    },
    {
        title: "Life as an International Student in Tokyo: A Complete Guide",
        excerpt: "Everything you need to know about living, studying, and thriving as an international student in Japan's bustling capital city.",
        content: `<h2>Welcome to Tokyo!</h2>
<p>Tokyo is an incredible city for international students, offering a unique blend of traditional culture and cutting-edge technology.</p>

<h3>Housing Options</h3>
<p>From student dormitories to share houses and private apartments, Tokyo offers various accommodation options to suit different budgets and preferences.</p>

<h3>Cost of Living</h3>
<p>Budget approximately Rs100,000-150,000 per month for living expenses including rent, food, transportation, and entertainment.</p>

<h3>Part-Time Work</h3>
<p>International students can work up to 28 hours per week during semesters and 40 hours during vacations with proper permission.</p>

<h3>Cultural Activities</h3>
<p>Take advantage of Tokyo's numerous museums, temples, festivals, and cultural events to immerse yourself in Japanese culture.</p>`,
        category: 'Student Life',
        tags: ['tokyo', 'student life', 'international students'],
        status: 'published',
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        featuredImage: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=1600"
    },
    {
        title: "Understanding the COE Application Process: Step by Step",
        excerpt: "A detailed walkthrough of the Certificate of Eligibility application process for prospective students in Japan.",
        content: `<h2>What is a COE?</h2>
<p>The Certificate of Eligibility (COE) is a crucial document issued by the Japanese Immigration Bureau that pre-approves your visa application.</p>

<h3>Step 1: School Application</h3>
<p>First, apply to and get accepted by a Japanese educational institution that's authorized to accept international students.</p>

<h3>Step 2: Document Preparation</h3>
<p>Gather all required documents including academic transcripts, financial statements, passport copies, and photos.</p>

<h3>Step 3: School Submits COE Application</h3>
<p>Your school will submit the COE application to the Immigration Bureau on your behalf.</p>

<h3>Step 4: Waiting Period</h3>
<p>The processing time typically ranges from 1-3 months. Use this time to prepare for your move.</p>

<h3>Step 5: Receive COE</h3>
<p>Once approved, your school will send you the COE, which you'll use to apply for your visa at a Japanese embassy or consulate.</p>`,
        category: 'Application Guide',
        tags: ['COE', 'visa process', 'documentation'],
        status: 'published',
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        featuredImage: "https://images.unsplash.com/photo-1524419986249-348e8fa6ad4a?auto=format&fit=crop&q=80&w=1600"
    },
    {
        title: "Success Story: From Nepal to Tokyo University",
        excerpt: "Meet Raj, who successfully navigated the visa process and is now pursuing his dreams at one of Japan's top universities.",
        content: `<h2>Meet Raj Kumar</h2>
<p>Raj Kumar from Kathmandu, Nepal, is now a second-year engineering student at the prestigious Tokyo University.</p>

<blockquote>
<p>"The visa process seemed overwhelming at first, but with proper guidance and preparation, everything fell into place perfectly."</p>
</blockquote>

<h3>The Journey</h3>
<p>Raj spent nearly a year preparing for his move to Japan, from studying Japanese to gathering financial documents and acing his university entrance exams.</p>

<h3>Challenges Overcome</h3>
<p>Language barrier, cultural adjustment, and homesickness were some initial challenges, but Raj found support through international student communities and university resources.</p>

<h3>Advice for Future Students</h3>
<ul>
<li>Start learning Japanese as early as possible</li>
<li>Research your university and program thoroughly</li>
<li>Join student communities before arriving</li>
<li>Be open to new experiences and cultural differences</li>
</ul>`,
        category: 'Success Stories',
        tags: ['success story', 'student experience', 'tokyo university'],
        status: 'published',
        publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        featuredImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600"
    },
    {
        title: "New Immigration Policies for 2025: What Students Need to Know",
        excerpt: "Stay updated with the latest changes in Japan's immigration policies affecting international students in 2025.",
        content: `<h2>2025 Policy Updates</h2>
<p>The Japanese government has announced several important changes to its immigration policies for international students.</p>

<h3>Extended Post-Graduation Work Period</h3>
<p>Graduates can now stay in Japan for up to 2 years to seek employment, up from the previous 1-year limit.</p>

<h3>Simplified Document Requirements</h3>
<p>Certain document requirements have been streamlined to make the application process more efficient.</p>

<h3>Digital Application System</h3>
<p>A new online portal will launch in Q2 2025, allowing students to submit and track applications digitally.</p>

<p><strong>Note:</strong> This is draft content for internal review. Will be published once policies are officially announced.</p>`,
        category: 'News',
        tags: ['immigration policy', '2025 updates', 'policy changes'],
        status: 'draft', // This one is a draft
        featuredImage: "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&q=80&w=1600"
    }
];

const seedBlogs = async () => {
    try {
        await connectDB();

        // Find a super admin user to use as author, or fallback to any user
        let author = await User.findOne({ role: 'super_admin' });

        if (!author) {
            console.log('No super_admin found, trying to find any user...');
            author = await User.findOne({});
        }

        if (!author) {
            console.log('No users found. Creating a dummy author...');
            // Create a dummy user
            author = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'super_admin'
            });
        }

        // Delete existing blogs
        await Blog.deleteMany({});
        console.log('Existing blogs deleted');

        // Add author to each blog post
        const blogsWithAuthor = blogPosts.map(blog => ({
            ...blog,
            author: author._id
        }));

        // Create new blogs one by one to isolate errors
        console.log('Inserting new blogs...');
        let successCount = 0;
        for (const blog of blogsWithAuthor) {
            try {
                const createdBlog = await Blog.create(blog);
                console.log(`- Created: ${createdBlog.title} (${createdBlog.status})`);
                successCount++;
            } catch (err) {
                console.error(`- Failed to create: ${blog.title}`);
                console.error(`  Error: ${err.message}`);
                // Continue to next
            }
        }
        console.log(`${successCount} / ${blogsWithAuthor.length} blog posts created.`);
        process.exit(0);

    } catch (error) {
        console.error('Error seeding blogs:', error);
        console.error(error.stack);
        process.exit(1);
    }
};

seedBlogs();
