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
        enum: ['document', 'exam', 'admin_only'],
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
