const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Public', 'Bank', 'Festival'],
        default: 'Public'
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Holiday', holidaySchema);