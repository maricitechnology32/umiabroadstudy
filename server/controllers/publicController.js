const Student = require('../models/Student');
const Consultancy = require('../models/Consultancy');
const User = require('../models/User');
const SiteContent = require('../models/SiteContent');
const AboutUs = require('../models/AboutUs');
const ContactSettings = require('../models/ContactSettings');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Get consolidated public landing page data
// @route   GET /api/public/landing-data
// @access  Public
exports.getPublicLandingData = async (req, res) => {
    try {
        // Fetch all required data in parallel
        const [consultancy, siteContent, aboutUs, contactSettings] = await Promise.all([
            Consultancy.findOne().select('name logo tagline email phone address website'),
            SiteContent.findOne(),
            AboutUs.findOne({ isActive: true }),
            ContactSettings.findOne({ active: true })
        ]);

        // Build response with fallback defaults
        const landingData = {
            // Consultancy Branding
            branding: {
                name: consultancy?.name || 'Your Consultancy',
                logo: consultancy?.logo || null,
                tagline: consultancy?.tagline || 'Your trusted visa consultancy partner',
                email: consultancy?.email || '',
                phone: consultancy?.phone || '',
                address: consultancy?.address || '',
                website: consultancy?.website || ''
            },
            // Site Content (Hero, Features, Stats, Testimonials, AI Section)
            content: {
                hero: siteContent?.hero || {
                    title: 'The Smartest Way to Move to Japan.',
                    subtitle: 'Automate your COE documents, track applications, and practice with our realistic AI Immigration Officer.',
                    badgeText: 'New: AI Mock Interviews V2.0',
                    ctaPrimary: { text: 'Free Visa Assessment', link: '/inquiry/default' },
                    ctaSecondary: { text: 'Watch Demo', link: '#' }
                },
                features: siteContent?.features?.length > 0 ? siteContent.features : [
                    { title: 'Auto-Document Gen', description: 'Generate COE Application forms, financial sponsors, and SOPs in one click.', icon: 'FileText' },
                    { title: 'Student CRM', description: 'Manage student profiles, documents, and application statuses from a single centralized dashboard.', icon: 'LayoutDashboard' },
                    { title: 'Error Checking', description: 'Our system validates data against Immigration Bureau standards to avoid rejections.', icon: 'ShieldCheck' }
                ],
                stats: siteContent?.stats?.length > 0 ? siteContent.stats : [
                    { value: '50+', label: 'Consultancies' },
                    { value: '10k+', label: 'Applications Processed' },
                    { value: '98%', label: 'Success Rate' }
                ],
                testimonials: siteContent?.testimonials?.length > 0 ? siteContent.testimonials : [],
                aiSection: siteContent?.aiSection || {
                    title: 'Practice with a Real AI Immigration Officer.',
                    description: "Don't let the interview scare you. Our AI simulator mimics a real Japanese immigration officer.",
                    features: []
                },
                seo: siteContent?.seo || {}
            },
            // About Us Data
            about: {
                title: aboutUs?.title || 'About Us',
                description: aboutUs?.description || '',
                mission: aboutUs?.mission || 'We are dedicated to helping students achieve their dreams of studying and working in Japan.',
                vision: aboutUs?.vision || '',
                values: aboutUs?.values || [],
                teamMembers: aboutUs?.teamMembers || [],
                stats: aboutUs?.stats?.length > 0 ? aboutUs.stats : [
                    { label: 'Visa Success Rate', value: '98%', icon: '✅' },
                    { label: 'Students Counseled', value: '10k+', icon: '👨‍🎓' },
                    { label: 'Office Locations', value: '5', icon: '🏢' },
                    { label: 'Student Support', value: '24/7', icon: '🕐' }
                ]
            },
            // Contact Information
            contact: {
                mainContact: contactSettings?.mainContact || {
                    companyName: consultancy?.name || 'Your Consultancy',
                    email: consultancy?.email || '',
                    phone: consultancy?.phone || '',
                    address: consultancy?.address || '',
                    description: ''
                },
                officeLocations: contactSettings?.officeLocations || [],
                socialMedia: contactSettings?.socialMedia || [],
                businessHours: contactSettings?.businessHours || [],
                supportInfo: contactSettings?.supportInfo || {
                    supportEmail: consultancy?.email || '',
                    supportPhone: consultancy?.phone || '',
                    responseTime: '24 hours'
                }
            }
        };

        res.status(200).json({ success: true, data: landingData });
    } catch (error) {
        console.error('Error fetching landing data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Get Consultancy Name/Logo for the Public Form
// @route   GET /api/public/consultancy/:id
exports.getPublicConsultancyInfo = async (req, res) => {
    try {
        const consultancy = await Consultancy.findById(req.params.id).select('name address phone');
        if (!consultancy) return res.status(404).json({ success: false, message: 'Consultancy not found' });
        res.status(200).json({ success: true, data: consultancy });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get default consultancy (first one found)
// @route   GET /api/public/consultancy/default
// @access  Public
exports.getDefaultConsultancy = async (req, res) => {
    try {
        const consultancy = await Consultancy.findOne().select('name logo address email phone socialMedia businessHours');
        if (!consultancy) {
            return res.status(404).json({ success: false, message: 'No consultancy found' });
        }
        res.status(200).json({ success: true, data: consultancy });
    } catch (error) {
        console.error('Error fetching default consultancy:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Submit Inquiry Form (Creates a 'Lead' student and User)
// @route   POST /api/public/inquiry
exports.submitInquiry = async (req, res) => {
    try {
        const { consultancyId, personalInfo, visaDetails } = req.body;

        // 1. Check if email exists
        const userExists = await User.findOne({ email: personalInfo.email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'You are already registered. Please login.' });
        }

        // 2. Create User (Student)
        // 2. Create User (Student)
        // We generate a secure random password and email it to them immediately
        const generatePassword = () => {
            const length = 12;
            const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            let retVal = "";
            retVal += "A"; retVal += "a"; retVal += "1"; retVal += "@";
            for (let i = 0, n = charset.length; i < length - 4; i++) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        };
        const tempPassword = generatePassword();

        const user = await User.create({
            name: `${personalInfo.firstName} ${personalInfo.lastName}`,
            email: personalInfo.email,
            password: tempPassword,
            role: 'student',
            consultancyId
        });

        // 3. Create Student Profile (Status: Lead)
        const student = await Student.create({
            user: user._id,
            consultancy: consultancyId,
            personalInfo,
            visaDetails, // Save the Japan specific data
            profileStatus: 'lead' // Mark as a Lead
        });

        user.studentProfileId = student._id;
        await user.save();

        // 4. Send Credentials Email
        const message = `
            Thank you for your inquiry!
            We have created an account for you to track your visa process.
            
            Login URL: ${process.env.CLIENT_URL}/login
            Email: ${personalInfo.email}
            Password: ${tempPassword}
        `;

        try {
            await sendEmail({
                email: personalInfo.email,
                subject: 'Japan Visa Application - Account Created',
                message
            });
        } catch (e) {
            console.error(e);
        }

        res.status(201).json({ success: true, message: 'Inquiry submitted successfully!' });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};