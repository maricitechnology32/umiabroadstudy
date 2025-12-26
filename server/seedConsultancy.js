const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Consultancy = require('./models/Consultancy');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const seedConsultancy = async () => {
    try {
        // Update existing consultancy or create new one
        let consultancy = await Consultancy.findOne();

        const consultancyData = {
            name: 'Himalaya Education Consultancy',
            email: 'info@himalayaedu.com',
            phone: '+977 1 4123456',
            address: 'Putalisadak, Kathmandu, Nepal',
            website: 'https://himalayaedu.com',
            tagline: 'Your trusted partner for Japan study visa success',
            logo: null, // Add logo URL if available
            isActive: true
        };

        if (consultancy) {
            // Update existing
            consultancy = await Consultancy.findByIdAndUpdate(
                consultancy._id,
                consultancyData,
                { new: true }
            );
            console.log('✅ Consultancy Updated:', consultancy.name);
        } else {
            // Create new
            consultancy = await Consultancy.create(consultancyData);
            console.log('✅ Consultancy Created:', consultancy.name);
        }

        console.log('📧 Email:', consultancy.email);
        console.log('📞 Phone:', consultancy.phone);
        console.log('📍 Address:', consultancy.address);
        console.log('💬 Tagline:', consultancy.tagline);

        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedConsultancy();
