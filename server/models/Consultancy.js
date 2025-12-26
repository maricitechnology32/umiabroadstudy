const mongoose = require('mongoose');

const consultancySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Consultancy name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Contact email is required'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: String,
    phone: String,
    website: String,
    // Branding
    logo: {
        type: String,
        default: null
    },
    tagline: {
        type: String,
        default: null
    },
    // Status to allow Super Admin to disable access if they don't pay
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Consultancy', consultancySchema);