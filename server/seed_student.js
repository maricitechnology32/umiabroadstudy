const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Consultancy = require('./models/Consultancy');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const seedStudent = async () => {
    try {
        const email = 'student@test.com';
        const password = 'password123';

        // 1. Get or Create Consultancy
        let consultancy = await Consultancy.findOne();
        if (!consultancy) {
            consultancy = await Consultancy.create({
                name: 'Test Consultancy',
                email: 'consultancy@test.com',
                phone: '1234567890',
                address: 'Test Address',
                domain: 'test.com'
            });
            console.log('Created Consultancy:', consultancy._id);
        } else {
            console.log('Using Consultancy:', consultancy._id);
        }

        // 2. Get or Create User
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name: 'Test Student',
                email: email,
                password: password,
                role: 'student',
                consultancyId: consultancy._id
            });
            console.log('Created User:', user._id);
        } else {
            console.log('User already exists:', user._id);
        }

        // 3. Get or Create Student Profile
        let student = await Student.findOne({ user: user._id });
        if (!student) {
            student = await Student.create({
                user: user._id,
                email: email,
                firstName: 'Test',
                lastName: 'Student',
                consultancy: consultancy._id, // LINK TO CONSULTANCY
                personalInfo: {
                    firstName: 'Test',
                    lastName: 'Student',
                    email: email
                },
                documents: {
                    citizenshipFront: 'https://placehold.co/400',
                    citizenshipBack: 'https://placehold.co/400'
                }
            });
            console.log('Created Student Profile:', student._id);
        } else {
            console.log('Student Profile already exists:', student._id);
        }

        console.log('Student ID for URL:', student._id.toString());
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedStudent();
