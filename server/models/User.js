// // const mongoose = require('mongoose');
// // const bcrypt = require('bcryptjs');

// // const userSchema = new mongoose.Schema({
// //     name: {
// //         type: String,
// //         required: [true, 'Please add a name']
// //     },
// //     email: {
// //         type: String,
// //         required: [true, 'Please add an email'],
// //         unique: true,
// //         match: [
// //             /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
// //             'Please add a valid email'
// //         ]
// //     },
// //     password: {
// //         type: String,
// //         required: [true, 'Please add a password'],
// //         minlength: 6,
// //         select: false // Don't return password by default in queries
// //     },
// //     role: {
// //         type: String,
// //         enum: ['super_admin', 'consultancy_admin', 'student'],
// //         default: 'student'
// //     },
// //     // Link to the Consultancy (Required for Admin and Student, Null for Super Admin)
// //     consultancyId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: 'Consultancy'
// //     },
// //     // If user is a student, link to their Profile data
// //     studentProfileId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: 'Student'
// //     },
// //     resetPasswordToken: String,
// //     resetPasswordExpire: Date,
// //     createdAt: {
// //         type: Date,
// //         default: Date.now
// //     }
// // });

// // // Encrypt password using bcrypt
// // userSchema.pre('save', async function(next) {
// //     if (!this.isModified('password')) {
// //         next();
// //     }
// //     const salt = await bcrypt.genSalt(10);
// //     this.password = await bcrypt.hash(this.password, salt);
// // });

// // // Match user entered password to hashed password in database
// // userSchema.methods.matchPassword = async function(enteredPassword) {
// //     return await bcrypt.compare(enteredPassword, this.password);
// // };

// // module.exports = mongoose.model('User', userSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Please add a name']
//     },
//     email: {
//         type: String,
//         required: [true, 'Please add an email'],
//         unique: true,
//         match: [
//             /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//             'Please add a valid email'
//         ]
//     },
//     password: {
//         type: String,
//         required: [true, 'Please add a password'],
//         minlength: 6,
//         select: false 
//     },
//     role: {
//         type: String,
//         enum: ['super_admin', 'consultancy_admin', 'student'],
//         default: 'student'
//     },
//     consultancyId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Consultancy'
//     },
//     studentProfileId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Student'
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // FIXED: Using modern async syntax (no 'next' parameter needed)
// userSchema.pre('save', async function() {
//     // Only run this function if password was actually modified
//     if (!this.isModified('password')) {
//         return;
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

// userSchema.methods.matchPassword = async function(enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: {
        province: { type: String },
        district: { type: String },
        municipality: { type: String },
        ward: { type: Number },
        tole: { type: String },
        formatted: { type: String }
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function (v) {
                // Require: 1 uppercase, 1 lowercase, 1 number, 1 special char
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\];:'"<>,.?/|\\])/.test(v);
            },
            message: 'Password must include uppercase, lowercase, number, and special character'
        },
        select: false
    },
    role: {
        type: String,
        enum: ['super_admin', 'consultancy_admin', 'consultancy_staff', 'student', 'counselor'],
        default: 'student'
    },
    subRole: {
        type: String,
        enum: ['receptionist', 'document_officer', 'manager', 'counselor', null],
        default: null
    },
    consultancyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultancy'
    },
    studentProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Account lockout fields (brute-force protection)
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    lastFailedLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function () {
    // Check if lockUntil is in the future
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Instance method to increment failed login attempts
userSchema.methods.incLoginAttempts = async function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: {
                loginAttempts: 1,
                lastFailedLogin: Date.now()
            },
            $unset: { lockUntil: 1 }
        });
    }

    // Otherwise increment
    const updates = {
        $inc: { loginAttempts: 1 },
        $set: { lastFailedLogin: Date.now() }
    };

    // Lock account after 5 failed attempts
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set.lockUntil = Date.now() + LOCK_TIME;
    }

    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1, lastFailedLogin: 1 }
    });
};

module.exports = mongoose.model('User', userSchema);