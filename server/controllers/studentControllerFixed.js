const Student = require('../models/Student');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const { createNotification, notifyConsultancyAdmins } = require('../utils/notificationHelper');

// @desc    Get all students for current consultancy
// @route   GET /api/students
// @access  Private (Consultancy Admin)
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({ consultancy: req.user.consultancyId })
            .populate({
                path: 'user',
                select: 'name email role subRole'
            })
            .lean();

        // STRICTLY Filter: Only return users who actually have the 'student' role
        const validStudents = students.filter(student => {
            if (!student.user) return false; // Orphaned record
            if (student.user.role !== 'student') return false;
            // Also exclude if subRole exists (staff)
            if (student.user.subRole) return false;
            return true;
        });

        res.status(200).json({ success: true, count: validStudents.length, data: validStudents });
    } catch (err) {
        console.error('getStudents Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Invite a new Student
// @route   POST /api/students/invite
// @access  Private (Consultancy Admin & Staff)
exports.inviteStudent = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Please provide both Name and Email' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User email already registered.' });
        }

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
            name,
            email,
            password: tempPassword,
            role: 'student',
            consultancyId: req.user.consultancyId
        });

        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

        const studentProfile = await Student.create({
            user: user._id,
            consultancy: req.user.consultancyId,
            personalInfo: { firstName, lastName, email }
        });

        user.studentProfileId = studentProfile._id;
        await user.save();

        const message = `
            You have been invited to the Japan Visa Portal.
            Please login to complete your profile details.
            
            Login URL: ${process.env.CLIENT_URL}/login
            Email: ${email}
            Password: ${tempPassword}
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Japan Visa Portal - Invitation',
                message
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.status(201).json({ success: true, data: studentProfile, message: 'Student invited successfully' });

    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current student's profile (For the Student themselves)
// @route   GET /api/students/me
// @access  Private (Student)
exports.getMyProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get specific student by ID (For Admin/Staff View)
// @route   GET /api/students/:id
// @access  Private (Consultancy Admin & Staff)
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private (Student & Admin & Staff)
exports.updateStudentProfile = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Authorization Logic
        if (req.user.role === 'student') {
            if (student.user.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
            }
        }

        if (['consultancy_admin', 'consultancy_staff'].includes(req.user.role)) {
            if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to manage this student' });
            }
        }

        student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (req.body.profileStatus) {
            const io = req.app.get('io');
            const status = req.body.profileStatus;
            const targetUserId = student.user.toString();

            try {
                await createNotification(io, targetUserId, {
                    title: 'Profile Status Updated',
                    message: `Your profile status has been changed to ${status.toUpperCase()}.`,
                    type: status === 'verified' ? 'success' : status === 'rejected' ? 'error' : 'info',
                    link: `/dashboard`
                });
            } catch (notifError) {
                console.error('[NOTIFICATION] Failed to create notification:', notifError);
            }
        }

        res.status(200).json({ success: true, data: student });

    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};
