const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        lowercase: true
    },
    excerpt: {
        type: String,
        required: [true, 'Please add an excerpt'],
        trim: true,
        maxlength: [300, 'Excerpt cannot be more than 300 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    featuredImage: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Visa Tips', 'Study in Japan', 'Success Stories', 'Student Life', 'Application Guide', 'News', 'Uncategorized'],
        default: 'Uncategorized'
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    viewCount: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create slug from title before saving
blogSchema.pre('save', async function () {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

// Add indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
