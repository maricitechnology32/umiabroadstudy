const SiteContent = require('../models/SiteContent');

// @desc    Get site content (public)
// @route   GET /api/site-content
// @access  Public
exports.getSiteContent = async (req, res) => {
    try {
        let content = await SiteContent.findOne();
        if (!content) {
            // Return default structure if no DB entry exists yet
            // (The frontend or a seed script could also handle this, but lazy init is nice)
            content = new SiteContent();
            await content.save();
        }
        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update site content
// @route   PUT /api/site-content
// @access  Private/Admin
exports.updateSiteContent = async (req, res) => {
    try {
        // Find the singleton document and update it
        // upsert: true will create it if it doesn't exist
        const content = await SiteContent.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
