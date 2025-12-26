const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const createSuperAdmin = async () => {
  try {
    const email = 'superadmin@admin.com';
    const password = 'password123'; // Simple password for initial setup

    // Check if admin already exists to prevent duplicates
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('Super Admin already exists!');
      process.exit();
    }

    // Create the Super Admin
    await User.create({
      name: 'Super Admin',
      email: email,
      password: password, // The User model pre-save hook will hash this automatically
      role: 'super_admin'
    });

    console.log('✅ Super Admin Created Successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createSuperAdmin();