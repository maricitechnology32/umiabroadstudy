const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Add a new staff member
// @route   POST /api/staff
// @access  Private (Consultancy Admin)
exports.addStaff = async (req, res) => {
    try {
        const { name, email, subRole } = req.body;

        if (!name || !email || !subRole) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and role' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Generate random password
        // Generate secure random password
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

        // Create User
        const user = await User.create({
            name,
            email,
            password: tempPassword,
            role: 'consultancy_staff',
            subRole: subRole, // 'receptionist' or 'document_officer'
            consultancyId: req.user.consultancyId
        });

        // Send Email
        const message = `
            You have been added as a ${subRole.replace('_', ' ')} to the Japan Visa Portal.
            
            Login URL: ${process.env.CLIENT_URL}/login
            Email: ${email}
            Password: ${tempPassword}
            
            Please change your password after logging in.
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Staff Account Created - Japan Visa Portal',
                message
            });
        } catch (error) {
            console.error("Email failed", error);
        }

        res.status(201).json({
            success: true,
            data: user,
            message: 'Staff member added and email sent'
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all staff for current consultancy
// @route   GET /api/staff
// @access  Private (Consultancy Admin)
exports.getStaff = async (req, res) => {
    try {
        const staff = await User.find({
            consultancyId: req.user.consultancyId,
            role: 'consultancy_staff'
        }).select('-password'); // Exclude password

        res.status(200).json({ success: true, count: staff.length, data: staff });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Remove a staff member
// @route   DELETE /api/staff/:id
// @access  Private (Consultancy Admin)
exports.removeStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Ensure we are deleting staff from OUR consultancy
        if (user.consultancyId.toString() !== req.user.consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await user.deleteOne();

        res.status(200).json({ success: true, message: 'Staff member removed' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};