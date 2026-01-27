const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String, // 'pdf', 'image', 'word', etc.
        default: 'other'
    },
    category: {
        type: String,
        enum: ['document', 'exam', 'admin_only', 'university_form'],
        default: 'document'
    },
    consultancy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultancy',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Workflow fields for university_form category
    workflowStatus: {
        type: String,
        enum: ['template', 'filled', 'verified', 'rejected'],
        default: 'template'
    },
    templateUrl: {
        type: String, // Preserves original template when filled version is uploaded
        default: null
    },
    verificationMessage: {
        type: String, // Admin feedback on verification/rejection
        default: null
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
