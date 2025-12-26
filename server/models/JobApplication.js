const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicantName: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    resumeUrl: {
        type: String,
        required: [true, 'Please upload your resume']
    },
    coverLetter: {
        type: String,
        maxlength: [2000, 'Cover letter cannot be more than 2000 characters']
    },
    linkedinUrl: {
        type: String,
        trim: true
    },
    portfolioUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'],
        default: 'new'
    },
    notes: {
        type: String
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
jobApplicationSchema.index({ job: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
