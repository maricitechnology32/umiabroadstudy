const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB...');

    // The email from your JSON
    const email = 'adarsha.sigdel12@gmail.com';

    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    // Manually set a new password (the pre-save hook in User.js will hash it)
    user.password = 'password123';
    await user.save();

    console.log(`✅ Password for ${email} reset to: password123`);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });