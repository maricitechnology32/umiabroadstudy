const Consultancy = require('../models/Consultancy');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto'); // Built-in Node module

// @desc    Register a new Consultancy (Super Admin only)
// @route   POST /api/consultancies
// @access  Private (Super Admin)
exports.createConsultancy = async (req, res) => {
    try {
        const { name, email, address, phone, website } = req.body;

        // 1. Check if consultancy email already exists as a user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // 2. Create Consultancy Record
        const consultancy = await Consultancy.create({
            name,
            email,
            address,
            phone,
            website
        });

        // 3. Generate a secure random password (must meet complexity requirements)
        const generatePassword = () => {
            const length = 12;
            const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            let retVal = "";

            // Ensure at least one of each required category
            retVal += "A"; // Uppercase
            retVal += "a"; // Lowercase
            retVal += "1"; // Number
            retVal += "@"; // Special

            for (let i = 0, n = charset.length; i < length - 4; i++) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        };
        const tempPassword = generatePassword();

        // 4. Create the Admin User for this Consultancy
        const user = await User.create({
            name: `${name} Admin`,
            email,
            password: tempPassword,
            role: 'consultancy_admin',
            consultancyId: consultancy._id
        });

        // 5. Send Email with Credentials
        const message = `
            Welcome to Japan Visa SaaS!
            You have been registered as a Consultancy Admin.
            
            Login URL: ${process.env.CLIENT_URL}/login
            Email: ${email}
            Temporary Password: ${tempPassword}
            
            Please change your password after logging in.
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Japan Visa SaaS - Account Created',
                message
            });
        } catch (error) {
            console.error(error);
            // We don't stop the process, but we log the error
        }

        res.status(201).json({
            success: true,
            data: consultancy,
            message: 'Consultancy created and invite email sent.'
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all consultancies
// @route   GET /api/consultancies
// @access  Private (Super Admin)
exports.getConsultancies = async (req, res) => {
    try {
        const consultancies = await Consultancy.find().sort('-createdAt');
        res.status(200).json({ success: true, count: consultancies.length, data: consultancies });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update consultancy
// @route   PUT /api/consultancies/:id
// @access  Private (super_admin, consultancy_admin)
exports.updateConsultancy = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, phone, website, logo, tagline, isActive } = req.body;

        // Find consultancy
        let consultancy = await Consultancy.findById(id);
        if (!consultancy) {
            return res.status(404).json({
                success: false,
                message: 'Consultancy not found'
            });
        }

        // Authorization check: consultancy admins can only update their own consultancy
        if (req.user.role === 'consultancy_admin' && req.user.consultancyId.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this consultancy'
            });
        }

        // Update fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (address !== undefined) updateData.address = address;
        if (phone !== undefined) updateData.phone = phone;
        if (website !== undefined) updateData.website = website;
        if (logo !== undefined) updateData.logo = logo;
        if (tagline !== undefined) updateData.tagline = tagline;
        // Only super_admin can change isActive status
        if (isActive !== undefined && req.user.role === 'super_admin') {
            updateData.isActive = isActive;
        }

        consultancy = await Consultancy.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: consultancy
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};