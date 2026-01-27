// // const Student = require('../models/Student');
// // const User = require('../models/User');
// // const sendEmail = require('../utils/emailService');
// // const crypto = require('crypto');

// // // @desc    Invite a new Student
// // // @route   POST /api/students/invite
// // // @access  Private (Consultancy Admin)
// // exports.inviteStudent = async (req, res) => {
// //     try {
// //         const { name, email } = req.body;

// //         // 1. Check if user exists
// //         const userExists = await User.findOne({ email });
// //         if (userExists) {
// //             return res.status(400).json({ success: false, message: 'Student email already exists' });
// //         }

// //         // 2. Generate random password
// //         const tempPassword = crypto.randomBytes(4).toString('hex');

// //         // 3. Create User Account
// //         const user = await User.create({
// //             name,
// //             email,
// //             password: tempPassword,
// //             role: 'student',
// //             consultancyId: req.user.consultancyId // Link to the inviter's consultancy
// //         });

// //         // 4. Create Empty Student Profile
// //         const studentProfile = await Student.create({
// //             user: user._id,
// //             consultancy: req.user.consultancyId,
// //             personalInfo: {
// //                 firstName: name.split(' ')[0],
// //                 lastName: name.split(' ')[1] || '',
// //                 email: email
// //             }
// //         });

// //         // 5. Update User with Profile Link
// //         user.studentProfileId = studentProfile._id;
// //         await user.save();

// //         // 6. Send Invite Email
// //         const message = `
// //             You have been invited to the Japan Visa Portal by your consultancy.
// //             Please login to complete your profile details.

// //             Login URL: ${process.env.CLIENT_URL}/login
// //             Email: ${email}
// //             Password: ${tempPassword}
// //         `;

// //         await sendEmail({
// //             email: user.email,
// //             subject: 'Japan Visa Portal - Invitation',
// //             message
// //         });

// //         res.status(201).json({
// //             success: true,
// //             data: studentProfile,
// //             message: 'Student invited successfully'
// //         });

// //     } catch (err) {
// //         res.status(400).json({ success: false, message: err.message });
// //     }
// // };

// // // @desc    Get all students for current consultancy
// // // @route   GET /api/students
// // // @access  Private (Consultancy Admin)
// // exports.getStudents = async (req, res) => {
// //     try {
// //         // Only fetch students belonging to this consultancy
// //         const students = await Student.find({ consultancy: req.user.consultancyId })
// //             .populate('user', 'name email');

// //         res.status(200).json({ success: true, count: students.length, data: students });
// //     } catch (err) {
// //         res.status(400).json({ success: false, message: err.message });
// //     }
// // };

// // // @desc    Get current student's profile (For the Student themselves)
// // // @route   GET /api/students/me
// // // @access  Private (Student)
// // exports.getMyProfile = async (req, res) => {
// //     try {
// //         const student = await Student.findOne({ user: req.user.id });
// //         if (!student) {
// //             return res.status(404).json({ success: false, message: 'Profile not found' });
// //         }
// //         res.status(200).json({ success: true, data: student });
// //     } catch (err) {
// //         res.status(400).json({ success: false, message: err.message });
// //     }
// // };

// // // @desc    Update student profile
// // // @route   PUT /api/students/:id
// // // @access  Private (Student & Admin)
// // exports.updateStudentProfile = async (req, res) => {
// //     try {
// //         let student = await Student.findById(req.params.id);

// //         if (!student) {
// //             return res.status(404).json({ success: false, message: 'Student not found' });
// //         }

// //         // Security Check: 
// //         // If user is a student, they can only update THEIR OWN profile
// //         if (req.user.role === 'student' && student.user.toString() !== req.user.id) {
// //             return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
// //         }

// //         // If user is admin, they must belong to the SAME consultancy
// //         if (req.user.role === 'consultancy_admin' && student.consultancy.toString() !== req.user.consultancyId.toString()) {
// //             return res.status(403).json({ success: false, message: 'Not authorized to manage this student' });
// //         }

// //         student = await Student.findByIdAndUpdate(req.params.id, req.body, {
// //             new: true,
// //             runValidators: true
// //         });

// //         res.status(200).json({ success: true, data: student });
// //     } catch (err) {
// //         res.status(400).json({ success: false, message: err.message });
// //     }
// // };

// const Student = require('../models/Student');
// const User = require('../models/User');
// const sendEmail = require('../utils/emailService');
// const crypto = require('crypto');

// // @desc    Invite a new Student
// // @route   POST /api/students/invite
// // @access  Private (Consultancy Admin)
// exports.inviteStudent = async (req, res) => {
//     try {
//         const { name, email } = req.body;

//         if (!name || !email) {
//             return res.status(400).json({ success: false, message: 'Please provide Name and Email' });
//         }

//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ success: false, message: 'User email already registered.' });
//         }

//         const tempPassword = crypto.randomBytes(4).toString('hex');

//         const user = await User.create({
//             name,
//             email,
//             password: tempPassword,
//             role: 'student',
//             consultancyId: req.user.consultancyId
//         });

//         // Split name safely
//         const nameParts = name.trim().split(' ');
//         const firstName = nameParts[0];
//         const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

//         const studentProfile = await Student.create({
//             user: user._id,
//             consultancy: req.user.consultancyId,
//             personalInfo: { firstName, lastName, email }
//         });

//         user.studentProfileId = studentProfile._id;
//         await user.save();

//         const message = `
//             You have been invited to the Japan Visa Portal.
//             Login URL: ${process.env.CLIENT_URL}/login
//             Email: ${email}
//             Password: ${tempPassword}
//         `;

//         try {
//             await sendEmail({
//                 email: user.email,
//                 subject: 'Japan Visa Portal - Invitation',
//                 message
//             });
//         } catch (emailError) {
//             console.error("Email failed:", emailError);
//         }

//         res.status(201).json({ success: true, data: studentProfile, message: 'Student invited successfully' });

//     } catch (err) {
//         console.error(err);
//         res.status(400).json({ success: false, message: err.message });
//     }
// };

// @desc    Get all students for current consultancy
// @route   GET /api/students
// @access  Private (Consultancy Admin)
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
        // This prevents staff members (who might have a generated student profile) from showing up
        const validStudents = students.filter(student => {
            if (!student.user) return false; // Orphaned record

            // Check Role
            if (student.user.role !== 'student') return false;

            // Extra Safety: Check SubRole (Staff usually have subRoles)
            if (student.user.subRole) return false;

            return true;
        });

        res.status(200).json({ success: true, count: validStudents.length, data: validStudents });
    } catch (err) {
        console.error('getStudents Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// // @desc    Get current student's profile (For Student Login)
// // @route   GET /api/students/me
// // @access  Private (Student)
// exports.getMyProfile = async (req, res) => {
//     try {
//         const student = await Student.findOne({ user: req.user.id });
//         if (!student) {
//             return res.status(404).json({ success: false, message: 'Profile not found' });
//         }
//         res.status(200).json({ success: true, data: student });
//     } catch (err) {
//         res.status(400).json({ success: false, message: err.message });
//     }
// };

// // @desc    Get specific student by ID (For Admin View)
// // @route   GET /api/students/:id
// // @access  Private (Consultancy Admin)
// exports.getStudentById = async (req, res) => {
//     try {
//         const student = await Student.findById(req.params.id);

//         if (!student) {
//             return res.status(404).json({ success: false, message: 'Student not found' });
//         }

//         // Security: Ensure admin owns this student
//         if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
//             return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
//         }

//         res.status(200).json({ success: true, data: student });
//     } catch (err) {
//         res.status(400).json({ success: false, message: err.message });
//     }
// };

// // @desc    Update student profile
// // @route   PUT /api/students/:id
// // @access  Private (Student & Admin)
// exports.updateStudentProfile = async (req, res) => {
//     try {
//         let student = await Student.findById(req.params.id);

//         if (!student) {
//             return res.status(404).json({ success: false, message: 'Student not found' });
//         }

//         // Authorization checks
//         if (req.user.role === 'student' && student.user.toString() !== req.user.id) {
//             return res.status(403).json({ success: false, message: 'Not authorized' });
//         }

//         if (req.user.role === 'consultancy_admin' && student.consultancy.toString() !== req.user.consultancyId.toString()) {
//             return res.status(403).json({ success: false, message: 'Not authorized' });
//         }

//         student = await Student.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         res.status(200).json({ success: true, data: student });
//     } catch (err) {
//         res.status(400).json({ success: false, message: err.message });
//     }
// };

const Student = require('../models/Student');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const { createNotification, notifyConsultancyAdmins } = require('../utils/notificationHelper');

// @desc    Invite a new Student
// @route   POST /api/students/invite
// @access  Private (Consultancy Admin & Staff)
exports.inviteStudent = async (req, res) => {
    try {
        const { name, email } = req.body;

        // 0. Validation
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Please provide both Name and Email' });
        }

        // 1. Check if user exists (Login Account)
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User email already registered.' });
        }

        // 2. Generate random password
        // 2. Generate secure random password
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

        // 3. Create User Account
        // Note: We assign the student to the SAME consultancy as the staff member inviting them
        const user = await User.create({
            name,
            email,
            password: tempPassword,
            role: 'student',
            consultancyId: req.user.consultancyId
        });

        // 4. Handle Name Splitting Safely (First/Last)
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

        // 5. Create Student Profile
        const studentProfile = await Student.create({
            user: user._id,
            consultancy: req.user.consultancyId,
            personalInfo: {
                firstName: firstName,
                lastName: lastName,
                email: email
            }
        });

        // 6. Link User to Profile
        user.studentProfileId = studentProfile._id;
        await user.save();

        // 7. Send Email
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

        res.status(201).json({
            success: true,
            data: studentProfile,
            message: 'Student invited successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all students for current consultancy
// @route   GET /api/students
// @access  Private (Consultancy Admin & Staff)
exports.getStudents = async (req, res) => {
    try {
        // Fetch students belonging to the same consultancy as the logged-in user (Admin or Staff)
        const students = await Student.find({ consultancy: req.user.consultancyId })
            .populate('user', 'name email')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (err) {
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

        // Security Check: Ensure the user (Admin/Staff) belongs to the same consultancy as the student
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
// exports.updateStudentProfile = async (req, res) => {
//     try {
//         let student = await Student.findById(req.params.id);

//         if (!student) {
//             return res.status(404).json({ success: false, message: 'Student not found' });
//         }

//         // Authorization Logic

//         // Case 1: User is a Student -> Can only update their OWN profile
//         if (req.user.role === 'student') {
//             if (student.user.toString() !== req.user.id) {
//                 return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
//             }
//         }

//         // Case 2: User is Consultancy Staff/Admin -> Must belong to same Consultancy
//         if (['consultancy_admin', 'consultancy_staff'].includes(req.user.role)) {
//             if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
//                 return res.status(403).json({ success: false, message: 'Not authorized to manage this student' });
//             }
//         }

//         // Perform Update
//         // Note: This generic update handles all fields (personal, family, academics, documents)
//         student = await Student.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         res.status(200).json({ success: true, data: student });
//     } catch (err) {
//         res.status(400).json({ success: false, message: err.message });
//     }
// };

exports.updateStudentProfile = async (req, res) => {
    try {
        // 1. Find the student first
        let student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // 2. Authorization Logic
        // Case A: User is a Student -> Can only update their OWN profile
        if (req.user.role === 'student') {
            if (student.user.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
            }
        }

        // Case B: User is Consultancy Staff/Admin -> Must belong to same Consultancy
        if (['consultancy_admin', 'consultancy_staff'].includes(req.user.role)) {
            if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to manage this student' });
            }
        }

        // 3. Perform Update
        student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // --- REAL-TIME NOTIFICATION LOGIC ---
        // Only send notification if 'profileStatus' was actually changed in this request
        // if (req.body.profileStatus) {
        //     const io = req.app.get('io');
        //     const status = req.body.profileStatus;

        //     // Emit to the student's specific room (using their User ID)
        //     io.to(student.user.toString()).emit("receive_notification", {
        //         id: Date.now(),
        //         title: "Profile Updated",
        //         message: `Your profile status has been changed to ${status.toUpperCase()}.`,
        //         type: status === 'verified' ? 'success' : 'info',
        //         timestamp: new Date()
        //     });
        // }

        if (req.body.profileStatus) {
            const io = req.app.get('io');
            const status = req.body.profileStatus;
            const targetUserId = student.user.toString();

            // Create persistent notification using helper
            try {
                await createNotification(io, targetUserId, {
                    title: 'Profile Status Updated',
                    message: `Your profile status has been changed to ${status.toUpperCase()}.`,
                    type: status === 'verified' ? 'success' : status === 'rejected' ? 'error' : 'info',
                    link: `/dashboard`
                });
                console.log(`[NOTIFICATION] Status change notification sent to user ${targetUserId}`);
            } catch (notifError) {
                console.error('[NOTIFICATION] Failed to create notification:', notifError);
            }
        }
        // ------------------------------------

        res.status(200).json({ success: true, data: student });

    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};