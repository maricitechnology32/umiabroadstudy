const mongoose = require('mongoose');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: {
        type: String,
        lowercase: true
    },
    department: {
        type: String,
        required: true,
        enum: ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'HR', 'Operations', 'Finance', 'Design']
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        trim: true
    },
    jobType: {
        type: String,
        required: true,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        default: 'full-time'
    },
    salaryRange: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'JPY' }
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    requirements: [{
        type: String,
        trim: true
    }],
    qualifications: [{
        type: String,
        trim: true
    }],
    responsibilities: [{
        type: String,
        trim: true
    }],
    benefits: [{
        type: String,
        trim: true
    }],
    applicationDeadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from title before saving
jobSchema.pre('save', async function () {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
});

// Add indexes for better query performance
jobSchema.index({ slug: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ department: 1 });
jobSchema.index({ jobType: 1 });

module.exports = mongoose.model('Job', jobSchema);
