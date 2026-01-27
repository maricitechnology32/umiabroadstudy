const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true
    },
    mission: {
        type: String,
        trim: true
    },
    vision: {
        type: String,
        trim: true
    },
    values: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        icon: {
            type: String, // Can store emoji or icon name
            default: '✨'
        }
    }],
    teamMembers: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            required: true,
            trim: true
        },
        bio: {
            type: String,
            trim: true
        },
        imageUrl: {
            type: String,
            default: ''
        },
        linkedin: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        }
    }],
    stats: [{
        label: {
            type: String,
            required: true,
            trim: true
        },
        value: {
            type: String,
            required: true,
            trim: true
        },
        icon: {
            type: String,
            default: '📊'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AboutUs', aboutUsSchema);
