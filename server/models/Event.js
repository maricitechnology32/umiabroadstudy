const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    consultancy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultancy',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: [true, 'Event date is required']
    },
    endDate: {
        type: String // Optional: for multi-day events
    },
    type: {
        type: String,
        enum: ['Class', 'Holiday', 'Deadline', 'Orientation', 'Meeting', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for efficient queries by consultancy and date
eventSchema.index({ consultancy: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
