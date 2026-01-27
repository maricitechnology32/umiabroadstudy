const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'maricitechnology32@gmail.com' });

        if (existingAdmin) {
            console.log('⚠️  Super admin already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            console.log('\nDeleting existing admin to recreate...');
            await User.deleteOne({ email: 'maricitechnology32@gmail.com' });
        }

        // Create super admin user with actual credentials
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'maricitechnology32@gmail.com',
            password: 'Ak192eb@1234', // User's password
            role: 'super_admin'
        });

        console.log('\n🎉 Super Admin Created Successfully!\n');
        console.log('='.repeat(50));
        console.log('📧 Email:    maricitechnology32@gmail.com');
        console.log('🔑 Password: Ak192eb@1234');
        console.log('👤 Role:     super_admin');
        console.log('='.repeat(50));
        console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
        console.log('You can now:');
        console.log('  1. Login to the dashboard');
        console.log('  2. Create consultancies');
        console.log('  3. Manage the system\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);

        if (error.name === 'ValidationError') {
            console.error('\nValidation errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }

        process.exit(1);
    }
};

createSuperAdmin();
