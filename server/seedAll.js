const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('./models/Blog');
const AboutUs = require('./models/AboutUs');
const Job = require('./models/Job');
const ContactSettings = require('./models/ContactSettings');
const SiteContent = require('./models/SiteContent');
const User = require('./models/User');

dotenv.config();

// ======================================
// 🏢 KDR CONSULTANCY - SEED DATA
// ======================================

// -------------------- ABOUT US --------------------
const aboutUsData = {
    title: "KDR Consultancy – Your Trusted Japan Study Visa Partner",
    description: "Since 2015, KDR Consultancy has been helping Nepali students achieve their dreams of studying in Japan. With a 98% visa success rate and over 5,000 students placed, we are Nepal's most trusted Japan education consultancy.",
    mission: "To empower every aspiring student in Nepal with the knowledge, resources, and support needed to successfully pursue higher education in Japan – making quality international education accessible and affordable.",
    vision: "To become Nepal's #1 Japan education consultancy, recognized for our integrity, innovation, and unwavering commitment to student success. We aim to send 10,000+ students to Japan by 2030.",
    values: [
        {
            title: "Student Success First",
            description: "Every decision we make prioritizes your academic and career success in Japan.",
            icon: "🎓"
        },
        {
            title: "Transparency",
            description: "No hidden fees, no false promises. We believe in honest, clear communication.",
            icon: "💎"
        },
        {
            title: "Excellence",
            description: "From document preparation to interview coaching, we maintain the highest standards.",
            icon: "🏆"
        },
        {
            title: "Innovation",
            description: "We use cutting-edge technology to streamline your visa application process.",
            icon: "🚀"
        },
        {
            title: "Cultural Bridge",
            description: "We don't just send students to Japan – we prepare them to thrive there.",
            icon: "🌸"
        },
        {
            title: "Lifetime Support",
            description: "Our relationship doesn't end at the airport. We support you throughout your Japan journey.",
            icon: "🤝"
        }
    ],
    teamMembers: [
        {
            name: "Kiran Dahal",
            role: "Founder & Managing Director",
            bio: "Former international student in Tokyo with 12+ years in Japan education consulting. Passionate about opening doors for Nepali students.",
            imageUrl: "",
            linkedin: "",
            email: "kiran@kdrconsultancy.com"
        },
        {
            name: "Dipesh Rai",
            role: "Chief Operations Officer",
            bio: "MBA from Osaka University. Expert in streamlining visa processes and maintaining our industry-leading success rate.",
            imageUrl: "",
            linkedin: "",
            email: "dipesh@kdrconsultancy.com"
        },
        {
            name: "Reshma Shakya",
            role: "Senior Visa Counselor",
            bio: "JLPT N2 certified with 8+ years helping students prepare winning COE applications. Specializes in interview coaching.",
            imageUrl: "",
            linkedin: "",
            email: "reshma@kdrconsultancy.com"
        },
        {
            name: "Bikash Tamang",
            role: "Japan University Relations Manager",
            bio: "Direct connections with 50+ Japanese language schools and universities. Helps match students with the perfect institution.",
            imageUrl: "",
            linkedin: "",
            email: "bikash@kdrconsultancy.com"
        },
        {
            name: "Anita Gurung",
            role: "Student Success Coordinator",
            bio: "Ensures every student has a smooth transition from Nepal to Japan. Expert in pre-departure training and accommodation.",
            imageUrl: "",
            linkedin: "",
            email: "anita@kdrconsultancy.com"
        }
    ],
    stats: [
        { label: "Students Sent to Japan", value: "5,000+", icon: "👥" },
        { label: "COE Success Rate", value: "98%", icon: "✅" },
        { label: "Partner Schools in Japan", value: "50+", icon: "🏫" },
        { label: "Years of Experience", value: "9+", icon: "📅" }
    ],
    isActive: true
};

// -------------------- SITE CONTENT (LANDING PAGE) --------------------
const siteContentData = {
    hero: {
        title: "Your Dream of Studying in Japan Starts Here.",
        subtitle: "Join 5,000+ Nepali students who trusted KDR Consultancy to guide them to Japan. From language school applications to visa approval – we handle it all.",
        badgeText: "🎉 Spring 2025 Intake Open – Apply Now!",
        ctaPrimary: { text: "Free Counseling", link: "/inquiry/default" },
        ctaSecondary: { text: "View Success Stories", link: "/about" }
    },
    features: [
        {
            title: "Complete COE Assistance",
            description: "We prepare all your Certificate of Eligibility documents with 100% accuracy.",
            icon: "FileText"
        },
        {
            title: "Smart Student Tracking",
            description: "Real-time updates on your application status. Login anytime to see exactly where you stand in the process.",
            icon: "LayoutDashboard"
        },
        {
            title: "Interview Preparation",
            description: "1-on-1 mock interviews with our JLPT-certified counselors prepare you for Embassy visa interviews.",
            icon: "ShieldCheck"
        }
    ],
    stats: [
        { label: "Students in Japan", value: "5,000+" },
        { label: "Success Rate", value: "98%" },
        { label: "Partner Schools", value: "50+" },
        { label: "Years Experience", value: "9+" }
    ],
    testimonials: [
        {
            name: "Suman Shrestha",
            role: "Tokyo Galaxy Language School, 2024",
            quote: "KDR made my Japan dream come true! From the first counseling to getting my visa, they guided me at every step. Now I'm studying in Tokyo!",
            image: ""
        },
        {
            name: "Priya Maharjan",
            role: "Osaka International College, 2023",
            quote: "I was nervous about the embassy interview, but the mock interviews at KDR prepared me so well. Got my visa on the first attempt!",
            image: ""
        },
        {
            name: "Ramesh Khadka",
            role: "Shin-Osaka Language School, 2024",
            quote: "Other consultancies gave me wrong information. KDR was honest and transparent from day one. That's why I recommend them to everyone.",
            image: ""
        }
    ],
    aiSection: {
        title: "Practice with Our AI Interview Simulator",
        description: "Don't let interview anxiety ruin your visa chances. Practice with our AI that simulates real Embassy visa interviews.",
        features: [
            "Real Japanese pronunciation feedback",
            "Common visa interview questions",
            "Instant feedback on your answers"
        ]
    },
    seo: {
        title: "KDR Consultancy – Nepal's #1 Japan Study Visa Consultancy",
        description: "5,000+ students sent to Japan with 98% visa success rate. Free counseling, complete COE assistance, and interview preparation for Nepali students."
    }
};

// -------------------- CONTACT SETTINGS --------------------
const contactSettingsData = {
    mainContact: {
        companyName: 'KDR Consultancy',
        email: 'info@kdrconsultancy.com',
        phone: '+977 9801234567',
        address: 'Putalisadak, Kathmandu, Nepal',
        description: "Nepal's trusted Japan education consultancy with 98% visa success rate."
    },
    officeLocations: [
        {
            name: 'Kathmandu Head Office',
            address: 'Putalisadak, Near Trade Tower, Kathmandu 44600, Nepal',
            phone: '+977 9801234567',
            email: 'kathmandu@kdrconsultancy.com',
            mapCoordinates: { lat: 27.7033, lng: 85.3147 }
        },
        {
            name: 'Pokhara Branch',
            address: 'Lakeside Road, Pokhara 33700, Nepal',
            phone: '+977 9807654321',
            email: 'pokhara@kdrconsultancy.com',
            mapCoordinates: { lat: 28.2096, lng: 83.9856 }
        }
    ],
    socialMedia: [
        { platform: 'facebook', url: 'https://facebook.com/kdrconsultancy' },
        { platform: 'instagram', url: 'https://instagram.com/kdrconsultancy' },
        { platform: 'youtube', url: 'https://youtube.com/@kdrconsultancy' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/kdrconsultancy' }
    ],
    businessHours: [
        { day: 'Sunday', hours: '10:00 AM - 6:00 PM', isOpen: true },
        { day: 'Monday', hours: '10:00 AM - 6:00 PM', isOpen: true },
        { day: 'Tuesday', hours: '10:00 AM - 6:00 PM', isOpen: true },
        { day: 'Wednesday', hours: '10:00 AM - 6:00 PM', isOpen: true },
        { day: 'Thursday', hours: '10:00 AM - 6:00 PM', isOpen: true },
        { day: 'Friday', hours: '10:00 AM - 6:00 PM', isOpen: true },
        { day: 'Saturday', hours: 'Closed', isOpen: false }
    ],
    supportInfo: {
        supportEmail: 'support@kdrconsultancy.com',
        supportPhone: '+977 9801234567',
        responseTime: 'Within 24 hours'
    },
    active: true
};

// -------------------- BLOG POSTS --------------------
const blogPostsData = [
    {
        title: "Complete Guide: How to Apply for Japan Student Visa from Nepal in 2025",
        excerpt: "Step-by-step guide covering everything from choosing a language school to getting your visa stamped. Updated for 2025 with latest requirements.",
        content: `<h2>Introduction</h2>
<p>Studying in Japan is a dream for thousands of Nepali students every year. With world-class universities, safe cities, and excellent part-time work opportunities, Japan offers an unparalleled educational experience. This guide will walk you through the complete process of applying for a Japan student visa from Nepal.</p>

<h3>Step 1: Choose Your Institution</h3>
<p>The first step is selecting a Japanese language school or university. Consider factors like location (Tokyo, Osaka, Fukuoka), tuition fees (typically ¥600,000-¥900,000/year), and course duration (1-2 years for language schools).</p>
<p><strong>Pro Tip:</strong> KDR Consultancy has partnerships with 50+ schools in Japan. We can help you find the perfect match based on your budget and goals.</p>

<h3>Step 2: Prepare Your Documents</h3>
<p>For COE (Certificate of Eligibility) application, you'll need:</p>
<ul>
<li>Passport (valid for at least 2 years)</li>
<li>Educational certificates (SLC/SEE, +2, etc.)</li>
<li>Bank balance certificate (minimum Rs. 15-20 lakhs)</li>
<li>Sponsor's documents (income proof, tax clearance)</li>
<li>JLPT certificate (if available)</li>
<li>Photographs (4x3 cm, white background)</li>
</ul>

<h3>Step 3: COE Application</h3>
<p>Once your documents are ready, they are submitted to the Immigration Bureau in Japan through your school. Processing takes 6-8 weeks. Our team ensures error-free applications to avoid rejections.</p>

<h3>Step 4: Embassy Visa Interview</h3>
<p>After receiving your COE, you'll apply at the Japan Embassy in Kathmandu. The interview typically covers:</p>
<ul>
<li>Why do you want to study in Japan?</li>
<li>Who is your financial sponsor?</li>
<li>What are your plans after graduation?</li>
</ul>
<p><strong>Our counselors provide mock interview sessions to prepare you for this crucial step.</strong></p>

<h3>Step 5: Visa Approval & Pre-Departure</h3>
<p>Once approved, you'll receive your visa within 3-5 days. Before departure, attend our pre-departure orientation covering Japanese culture, money exchange, and what to expect at the airport.</p>

<h2>Conclusion</h2>
<p>The Japan student visa process may seem complex, but with the right guidance, it becomes straightforward. KDR Consultancy has helped 5,000+ students successfully get their visas. Contact us for free counseling!</p>`,
        category: 'Application Guide',
        tags: ['japan visa', 'student visa', 'nepal', 'COE', 'step by step'],
        status: 'published',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
        title: "Top 10 Japanese Language Schools in Tokyo for Nepali Students (2025)",
        excerpt: "Detailed comparison of the best language schools in Tokyo including fees, scholarships, and part-time job support for Nepali students.",
        content: `<h2>Why Tokyo?</h2>
<p>Tokyo is the top destination for Nepali students studying in Japan. As the capital city, it offers the best part-time job opportunities (average ¥1,000-1,200/hour), cultural experiences, and connections for future employment.</p>

<h3>1. Tokyo Galaxy Japanese Language School</h3>
<p><strong>Location:</strong> Minato-ku, Tokyo</p>
<p><strong>Tuition:</strong> ¥780,000/year</p>
<p><strong>Why We Recommend:</strong> Excellent job placement support, modern facilities, and a supportive international community. Many of our students have attended this school.</p>

<h3>2. Kudan Institute of Japanese Language</h3>
<p><strong>Location:</strong> Chiyoda-ku, Tokyo</p>
<p><strong>Tuition:</strong> ¥700,000/year</p>
<p><strong>Why We Recommend:</strong> Known for university preparation courses and JLPT focused curriculum.</p>

<h3>3. ISI Japanese Language School</h3>
<p><strong>Location:</strong> Shinjuku, Tokyo</p>
<p><strong>Tuition:</strong> ¥750,000/year</p>
<p><strong>Why We Recommend:</strong> One of the largest language school chains with excellent dormitory facilities.</p>

<h3>4. ARC Academy Tokyo</h3>
<p><strong>Location:</strong> Shibuya-ku, Tokyo</p>
<p><strong>Tuition:</strong> ¥680,000/year</p>
<p><strong>Why We Recommend:</strong> Affordable with good academic track record.</p>

<h3>5. Shinjuku Japanese Language Institute</h3>
<p><strong>Location:</strong> Shinjuku, Tokyo</p>
<p><strong>Tuition:</strong> ¥720,000/year</p>
<p><strong>Why We Recommend:</strong> Unique "Ezoe Method" for faster Japanese learning.</p>

<h2>How to Choose the Right School?</h2>
<p>Consider these factors:</p>
<ul>
<li><strong>Location:</strong> Proximity to part-time jobs and transportation</li>
<li><strong>Dormitory:</strong> Some schools offer accommodation (¥30,000-50,000/month)</li>
<li><strong>Course Focus:</strong> University prep vs. conversation vs. JLPT</li>
<li><strong>Student Support:</strong> Job hunting assistance, visa extension help</li>
</ul>

<p>KDR Consultancy can help you choose the perfect school based on your goals and budget. Contact us for personalized recommendations!</p>`,
        category: 'Study in Japan',
        tags: ['tokyo', 'language school', 'japanese', 'nepali students'],
        status: 'published',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
        title: "How Much Does It Cost to Study in Japan from Nepal? (Full Breakdown 2025)",
        excerpt: "Complete cost breakdown including tuition, living expenses, initial deposits, and tips on how to save money as a Nepali student in Japan.",
        content: `<h2>Total Cost Overview</h2>
<p>Many students ask: "How much money do I need to study in Japan?" Here's a comprehensive breakdown for Nepali students planning to study in Japan in 2025.</p>

<h3>Before Departure Costs</h3>
<table>
<tr><td>Consultancy Service Fee</td><td>Rs. 50,000 - 100,000</td></tr>
<tr><td>Document Preparation</td><td>Rs. 10,000 - 20,000</td></tr>
<tr><td>Embassy Visa Fee</td><td>Rs. 2,500</td></tr>
<tr><td>Flight Ticket (One-way)</td><td>Rs. 80,000 - 120,000</td></tr>
<tr><td>Initial Clothing & Essentials</td><td>Rs. 30,000 - 50,000</td></tr>
</table>
<p><strong>Total Before Departure:</strong> Rs. 1,70,000 - 2,90,000</p>

<h3>First Year in Japan</h3>
<table>
<tr><td>Tuition Fee (Language School)</td><td>¥700,000 - 900,000 (Rs. 6-8 lakhs)</td></tr>
<tr><td>Dormitory/Room Rent</td><td>¥40,000 - 60,000/month</td></tr>
<tr><td>Food & Daily Living</td><td>¥30,000 - 40,000/month</td></tr>
<tr><td>Transportation</td><td>¥8,000 - 15,000/month</td></tr>
<tr><td>Health Insurance</td><td>¥1,500/month</td></tr>
</table>

<h3>Part-Time Job Income</h3>
<p><strong>The Good News:</strong> International students can work up to 28 hours/week during semester and 40 hours during holidays.</p>
<p><strong>Average Hourly Rate:</strong> ¥1,000 - 1,200</p>
<p><strong>Monthly Income Potential:</strong> ¥100,000 - 130,000</p>

<h2>Bank Balance Requirement</h2>
<p>For COE approval, sponsors typically need to show Rs. 15-20 lakhs in bank balance. This can include fixed deposits and sponsor's savings.</p>

<h2>Money-Saving Tips</h2>
<ul>
<li>Choose schools outside central Tokyo (lower rent)</li>
<li>Share apartments with other students</li>
<li>Cook at home (Japanese supermarkets have affordable options)</li>
<li>Get a second-hand bicycle (saves transportation costs)</li>
<li>Apply for scholarships (JASSO, MEXT, school-specific)</li>
</ul>

<p>Need financial planning help? KDR Consultancy provides free counseling sessions to help you create a realistic budget for your Japan studies.</p>`,
        category: 'Visa Tips',
        tags: ['cost', 'money', 'budget', 'expenses', 'part-time job'],
        status: 'published',
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
        title: "From Kathmandu to Tokyo: Suman's Journey to Japan with KDR Consultancy",
        excerpt: "Read how Suman Shrestha from Bhaktapur successfully got his Japan student visa and is now pursuing his dreams in Tokyo.",
        content: `<h2>Meet Suman</h2>
<p>Suman Shrestha, 22, from Bhaktapur, always dreamed of studying in Japan. Inspired by Japanese anime and technology, he decided to pursue higher education in the Land of the Rising Sun.</p>

<blockquote>
<p>"I visited many consultancies, but KDR was the only one that gave me honest answers. They didn't make false promises – just showed me the real path to Japan."</p>
<p>– Suman Shrestha</p>
</blockquote>

<h3>The Challenge</h3>
<p>Suman's family had limited financial resources. His father, a small business owner, wasn't sure if they could afford the costs. Many consultancies told him it was impossible without Rs. 25+ lakhs in the bank.</p>

<h3>How KDR Helped</h3>
<p>Our counselor Reshma carefully analyzed Suman's situation and created a realistic plan:</p>
<ul>
<li>Selected a school with lower initial fees but good reputation</li>
<li>Helped consolidate family savings to meet immigration requirements</li>
<li>Prepared comprehensive documentation showing genuine intent</li>
<li>Conducted 5 mock interview sessions in Japanese and English</li>
</ul>

<h3>The Result</h3>
<p>After 8 weeks of COE processing, Suman received his Certificate of Eligibility. His embassy interview went smoothly, and he received his visa the same week!</p>

<h3>Suman Today</h3>
<p>Suman is now a student at Tokyo Galaxy Japanese Language School. He works part-time at a convenience store, earning ¥110,000/month, which covers his living expenses. His goal is to join a Japanese technology company after completing his studies.</p>

<blockquote>
<p>"My part-time income covers my rent and food. I'm even saving money to send back home! Japan is truly a country of opportunities."</p>
</blockquote>

<h2>Your Story Could Be Next</h2>
<p>Like Suman, you too can achieve your Japan dream. Contact KDR Consultancy today for free counseling!</p>`,
        category: 'Success Stories',
        tags: ['success story', 'student experience', 'tokyo', 'inspiration'],
        status: 'published',
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
    },
    {
        title: "Japan Student Visa Interview: Common Questions and Best Answers",
        excerpt: "Prepare for your Japan Embassy visa interview with these commonly asked questions and expert tips from our experienced counselors.",
        content: `<h2>About the Embassy Interview</h2>
<p>The visa interview at the Japan Embassy in Kathmandu is the final step before your Japan dream becomes reality. While intimidating, proper preparation makes it smooth and successful.</p>

<h3>What to Expect</h3>
<p>The interview is typically conducted at the Embassy's visa window. It lasts 5-10 minutes and is conducted in English (sometimes Japanese if you claim language proficiency).</p>

<h3>Common Questions & Sample Answers</h3>

<h4>Q1: Why do you want to study in Japan?</h4>
<p><strong>Good Answer:</strong> "I want to study Japanese language and culture. Japan is a leader in technology and innovation. After completing my language studies, I plan to pursue a degree in Computer Science at a Japanese university. The education system's focus on practical skills will help me in my career."</p>
<p><strong>Avoid:</strong> "Because Japan is a developed country" or vague answers.</p>

<h4>Q2: Why did you choose this particular school?</h4>
<p><strong>Good Answer:</strong> "I researched many schools and chose [School Name] because of their strong JLPT preparation courses, convenient location near Shinjuku station for part-time work opportunities, and positive reviews from former students."</p>

<h4>Q3: Who is your financial sponsor?</h4>
<p><strong>Good Answer:</strong> "My father is my financial sponsor. He owns a [type of business] in [location]. His annual income is approximately Rs. [amount], and he has prepared savings of Rs. [amount] for my education in Japan."</p>

<h4>Q4: What are your plans after graduation?</h4>
<p><strong>Good Answer:</strong> "After completing my language program, I plan to apply to Japanese universities for a bachelor's degree in [field]. Eventually, I want to work for a Japanese company to gain international experience, and then return to Nepal to contribute to my country's development."</p>

<h4>Q5: Have you studied Japanese before?</h4>
<p><strong>If Yes:</strong> "Yes, I have been studying Japanese for [duration]. I passed JLPT N5/N4, and I can introduce myself in Japanese: 私の名前は[name]です。よろしくお願いします。"</p>
<p><strong>If No:</strong> "I have started basic self-study using [app/book]. I understand the Japanese writing systems and can read hiragana and katakana."</p>

<h3>Do's and Don'ts</h3>
<h4>✅ Do:</h4>
<ul>
<li>Dress formally (clean, professional attire)</li>
<li>Maintain eye contact and speak clearly</li>
<li>Bring all original documents organized in a folder</li>
<li>Be honest – never lie or exaggerate</li>
<li>Stay calm even if asked difficult questions</li>
</ul>

<h4>❌ Don't:</h4>
<ul>
<li>Arrive late (be 30 minutes early)</li>
<li>Give memorized robotic answers</li>
<li>Mention working as a primary goal</li>
<li>Show nervousness or frustration</li>
<li>Contradict information in your documents</li>
</ul>

<h2>Practice Makes Perfect</h2>
<p>KDR Consultancy offers mock interview sessions where our experienced counselors simulate the actual embassy interview. We help you refine your answers and build confidence. Contact us to schedule your session!</p>`,
        category: 'Visa Tips',
        tags: ['embassy interview', 'visa tips', 'preparation', 'questions'],
        status: 'published',
        publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    },
    {
        title: "JLPT Guide for Nepali Students: N5 to N1 Explained",
        excerpt: "Everything you need to know about the Japanese Language Proficiency Test – levels, benefits, and preparation tips.",
        content: `<h2>What is JLPT?</h2>
<p>The Japanese Language Proficiency Test (JLPT) is the most widely recognized Japanese language certification worldwide. It's conducted twice a year (July and December) in Nepal at Alliance Française Kathmandu.</p>

<h3>JLPT Levels Explained</h3>

<h4>N5 - Beginner Level</h4>
<p><strong>Skills:</strong> Read and understand hiragana, katakana, basic kanji (100 characters). Understand everyday expressions and basic phrases.</p>
<p><strong>Study Time:</strong> 150 hours (3-4 months intensive)</p>
<p><strong>Use:</strong> Proof of basic Japanese knowledge for visa applications</p>

<h4>N4 - Elementary Level</h4>
<p><strong>Skills:</strong> 300+ kanji, basic daily conversation, read simple materials</p>
<p><strong>Study Time:</strong> 300 hours (6-8 months)</p>
<p><strong>Use:</strong> Strengthens COE application, shows commitment</p>

<h4>N3 - Intermediate Level</h4>
<p><strong>Skills:</strong> 650+ kanji, understand everyday Japanese, read simple articles</p>
<p><strong>Study Time:</strong> 450-600 hours</p>
<p><strong>Use:</strong> Requirement for some vocational schools, better part-time jobs</p>

<h4>N2 - Upper Intermediate</h4>
<p><strong>Skills:</strong> 1000+ kanji, read newspapers, understand lectures</p>
<p><strong>Study Time:</strong> 600-900 hours</p>
<p><strong>Use:</strong> Required for most Japanese companies and universities</p>

<h4>N1 - Advanced Level</h4>
<p><strong>Skills:</strong> 2000+ kanji, near-native comprehension</p>
<p><strong>Study Time:</strong> 900-1200+ hours</p>
<p><strong>Use:</strong> Top-tier companies, translation jobs, graduate school</p>

<h3>Do You Need JLPT Before Going to Japan?</h3>
<p><strong>For Language School:</strong> Not required, but N5/N4 strengthens your application</p>
<p><strong>For University (English Program):</strong> Not required</p>
<p><strong>For University (Japanese Program):</strong> Usually N2 required</p>

<h3>Study Resources</h3>
<ul>
<li><strong>Textbooks:</strong> Minna no Nihongo, Genki series</li>
<li><strong>Apps:</strong> Duolingo, WaniKani, Anki</li>
<li><strong>YouTube:</strong> JapanesePod101, Japanese Ammo</li>
<li><strong>Practice Tests:</strong> Official JLPT practice tests</li>
</ul>

<h2>KDR Language Support</h2>
<p>We offer basic Japanese language orientation for all our students before departure. Learning hiragana, katakana, and survival phrases makes your first days in Japan much easier!</p>`,
        category: 'Study in Japan',
        tags: ['JLPT', 'japanese language', 'test', 'preparation'],
        status: 'published',
        publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
    }
];

// -------------------- JOBS --------------------
const jobsData = [
    {
        title: 'Student Counselor - Japan Education',
        department: 'Customer Support',
        location: 'Kathmandu, Nepal',
        jobType: 'full-time',
        salaryRange: { min: 35000, max: 50000, currency: 'NPR' },
        description: '<p>Join our team as a Student Counselor and help Nepali students achieve their dreams of studying in Japan.</p><p>You will guide students through the complete Japan visa application process, from initial consultation to visa approval.</p>',
        requirements: [
            'Excellent communication skills in Nepali and English',
            'Knowledge of Japan education system (language schools, universities)',
            'Experience with visa application processes',
            'Computer proficiency (MS Office, email, CRM systems)'
        ],
        qualifications: [
            "Bachelor's degree in any field",
            '1+ years in education consulting or customer service',
            'JLPT N5 or higher preferred (not required)'
        ],
        responsibilities: [
            'Provide consultation to prospective students and parents',
            'Guide students in school selection based on their goals and budget',
            'Assist in document collection and verification',
            'Prepare students for embassy visa interviews',
            'Maintain student records in our CRM system'
        ],
        benefits: [
            'Competitive salary with performance bonuses',
            'Professional development opportunities',
            'Friendly work environment',
            'Dashain/Tihar bonus'
        ],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
    },
    {
        title: 'Marketing Executive - Digital Marketing',
        department: 'Marketing',
        location: 'Kathmandu, Nepal',
        jobType: 'full-time',
        salaryRange: { min: 30000, max: 45000, currency: 'NPR' },
        description: '<p>We are looking for a creative Marketing Executive to help promote KDR Consultancy across digital platforms and increase student inquiries.</p>',
        requirements: [
            'Experience with Facebook, Instagram, and YouTube marketing',
            'Basic graphic design skills (Canva, Photoshop)',
            'Strong written communication in Nepali and English',
            'Understanding of digital advertising (Meta Ads, Google Ads)'
        ],
        qualifications: [
            "Bachelor's degree in Marketing, Business, or related field",
            '1-2 years of digital marketing experience',
            'Portfolio of previous campaigns'
        ],
        responsibilities: [
            'Create and manage social media content',
            'Run paid advertising campaigns',
            'Coordinate with counselors for success stories content',
            'Track and report marketing performance metrics',
            'Attend education fairs and events'
        ],
        benefits: [
            'Creative freedom',
            'Performance incentives',
            'Learning opportunities',
            'Team outings and events'
        ],
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'active'
    },
    {
        title: 'Documentation Officer',
        department: 'Operations',
        location: 'Kathmandu, Nepal',
        jobType: 'full-time',
        salaryRange: { min: 25000, max: 35000, currency: 'NPR' },
        description: '<p>Ensure accurate preparation of all COE (Certificate of Eligibility) documents for visa applications to Japan.</p>',
        requirements: [
            'Excellent attention to detail',
            'Proficiency in MS Word and Excel',
            'Ability to work with strict deadlines',
            'Basic Japanese language knowledge preferred'
        ],
        qualifications: [
            '+2 or Bachelor degree',
            'Experience in documentation or administrative work'
        ],
        responsibilities: [
            'Collect and verify student documents',
            'Prepare COE application packages',
            'Coordinate with Japanese language schools',
            'Maintain organized student files',
            'Track application status and deadlines'
        ],
        benefits: [
            'Stable work environment',
            'Training provided',
            'Career growth opportunities'
        ],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
    }
];

// ======================================
// SEED FUNCTION
// ======================================

const seedAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected...\n');

        // Find or create admin user for author/postedBy fields
        let admin = await User.findOne({ role: 'super_admin' });
        if (!admin) {
            admin = await User.findOne({});
        }
        if (!admin) {
            console.log('⚠️  No users found. Please run seeder.js first to create super admin.');
            process.exit(1);
        }
        console.log(`Using admin: ${admin.email}\n`);

        // Seed About Us
        console.log('📌 Seeding About Us...');
        await AboutUs.deleteMany({});
        await AboutUs.create(aboutUsData);
        console.log('   ✓ About Us created\n');

        // Seed Site Content
        console.log('📌 Seeding Site Content...');
        await SiteContent.deleteMany({});
        await SiteContent.create(siteContentData);
        console.log('   ✓ Site Content created\n');

        // Seed Contact Settings
        console.log('📌 Seeding Contact Settings...');
        await ContactSettings.deleteMany({});
        await ContactSettings.create(contactSettingsData);
        console.log('   ✓ Contact Settings created\n');

        // Seed Blog Posts
        console.log('📌 Seeding Blog Posts...');
        await Blog.deleteMany({});
        for (const post of blogPostsData) {
            await Blog.create({ ...post, author: admin._id });
            console.log(`   ✓ ${post.title.substring(0, 50)}...`);
        }
        console.log(`   Total: ${blogPostsData.length} blog posts\n`);

        // Seed Jobs
        console.log('📌 Seeding Jobs...');
        await Job.deleteMany({});
        for (const job of jobsData) {
            await Job.create({ ...job, postedBy: admin._id });
            console.log(`   ✓ ${job.title}`);
        }
        console.log(`   Total: ${jobsData.length} jobs\n`);

        console.log('🎉 All seed data created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Summary:');
        console.log(`  • About Us: 1 document`);
        console.log(`  • Site Content: 1 document`);
        console.log(`  • Contact Settings: 1 document`);
        console.log(`  • Blog Posts: ${blogPostsData.length} posts`);
        console.log(`  • Jobs: ${jobsData.length} listings`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedAll();
