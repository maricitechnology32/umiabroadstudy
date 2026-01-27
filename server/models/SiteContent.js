const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
    // Hero Section
    hero: {
        title: { type: String, default: 'The Smartest Way to Move to Japan.' },
        subtitle: { type: String, default: 'Automate your COE documents, track applications, and practice with our realistic AI Immigration Officer.' },
        badgeText: { type: String, default: 'New: AI Mock Interviews V2.0' },
        ctaPrimary: { text: { type: String, default: 'Start Free Trial' }, link: { type: String, default: '/register' } },
        ctaSecondary: { text: { type: String, default: 'Watch Demo' }, link: { type: String, default: '#' } }
    },

    // Features Section
    features: [{
        title: String,
        description: String,
        icon: String // Store icon name (e.g. 'FileText', 'Zap')
    }],

    // Stats Section
    stats: [{
        label: String,
        value: String
    }],

    // Testimonials Section
    testimonials: [{
        name: String,
        role: String,
        quote: String,
        image: String
    }],

    // AI Section
    aiSection: {
        title: { type: String, default: 'Practice with a Real AI Immigration Officer.' },
        description: { type: String, default: "Don't let the interview scare you. Our AI simulator mimics a real Japanese immigration officer." },
        features: [String] // List of bullet points
    },

    // Meta / Global
    seo: {
        title: { type: String, default: 'JapanVisa.ai - Automate COE & Practice Interviews' },
        description: String
    },

    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
