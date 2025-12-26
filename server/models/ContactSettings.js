const mongoose = require('mongoose');

const contactSettingsSchema = new mongoose.Schema({
    mainContact: {
        companyName: {
            type: String,
            required: true,
            default: 'Japan Visa SaaS'
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        }
    },
    officeLocations: [{
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        mapCoordinates: {
            lat: Number,
            lng: Number
        }
    }],
    socialMedia: [{
        platform: {
            type: String,
            required: true,
            enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github']
        },
        url: {
            type: String,
            required: true
        }
    }],
    businessHours: [{
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        hours: {
            type: String,
            required: true
        },
        isOpen: {
            type: Boolean,
            default: true
        }
    }],
    supportInfo: {
        supportEmail: {
            type: String
        },
        supportPhone: {
            type: String
        },
        responseTime: {
            type: String,
            default: '24 hours'
        }
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ContactSettings', contactSettingsSchema);
