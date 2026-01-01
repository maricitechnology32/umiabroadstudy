const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ContactSettings = require('./models/ContactSettings');

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

const contactData = {
    mainContact: {
        companyName: 'Global Flow',
        email: 'contact@globalflow.com',
        phone: '+81 3-1234-5678',
        address: '1-2-3 Shibuya, Shibuya-ku, Tokyo 150-0002, Japan',
        description: 'Your trusted partner for global visa applications and consultancy services'
    },
    officeLocations: [
        {
            name: 'Tokyo Headquarters',
            address: '1-2-3 Shibuya, Shibuya-ku, Tokyo 150-0002, Japan',
            phone: '+81 3-1234-5678',
            email: 'tokyo@globalflow.com',
            mapCoordinates: { lat: 35.6762, lng: 139.6503 }
        },
        {
            name: 'Osaka Office',
            address: '4-5-6 Umeda, Kita-ku, Osaka 530-0001, Japan',
            phone: '+81 6-5678-1234',
            email: 'osaka@globalflow.com',
            mapCoordinates: { lat: 34.7024, lng: 135.4959 }
        }
    ],
    socialMedia: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/japanvisasaas' },
        { platform: 'twitter', url: 'https://twitter.com/japanvisasaas' },
        { platform: 'facebook', url: 'https://facebook.com/japanvisasaas' },
        { platform: 'instagram', url: 'https://instagram.com/japanvisasaas' }
    ],
    businessHours: [
        { day: 'Monday', hours: '9:00 AM - 6:00 PM', isOpen: true },
        { day: 'Tuesday', hours: '9:00 AM - 6:00 PM', isOpen: true },
        { day: 'Wednesday', hours: '9:00 AM - 6:00 PM', isOpen: true },
        { day: 'Thursday', hours: '9:00 AM - 6:00 PM', isOpen: true },
        { day: 'Friday', hours: '9:00 AM - 6:00 PM', isOpen: true },
        { day: 'Saturday', hours: '10:00 AM - 4:00 PM', isOpen: true },
        { day: 'Sunday', hours: 'Closed', isOpen: false }
    ],
    supportInfo: {
        supportEmail: 'support@globalflow.com',
        supportPhone: '+81 3-1234-5678',
        responseTime: 'Within 24 hours'
    },
    active: true
};

const seedContactSettings = async () => {
    try {
        await connectDB();

        // Delete existing contact settings
        await ContactSettings.deleteMany({});
        console.log('Existing contact settings deleted');

        // Create new contact settings
        const created = await ContactSettings.create(contactData);
        console.log('✅ Contact settings created successfully!');
        console.log(`Company: ${created.mainContact.companyName}`);
        console.log(`Email: ${created.mainContact.email}`);
        console.log(`Phone: ${created.mainContact.phone}`);
        console.log(`Office Locations: ${created.officeLocations.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding contact settings:', error);
        process.exit(1);
    }
};

seedContactSettings();
