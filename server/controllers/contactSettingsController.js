const ContactSettings = require('../models/ContactSettings');

// @desc    Get active contact settings (public)
// @route   GET /api/contact-settings
// @access  Public
exports.getContactSettings = async (req, res) => {
    try {
        const settings = await ContactSettings.findOne({ active: true });

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'No active contact settings found'
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all contact settings (admin)
// @route   GET /api/contact-settings/admin/all
// @access  Private (super_admin, consultancy_admin)
exports.getAllContactSettings = async (req, res) => {
    try {
        const settings = await ContactSettings.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: settings.length,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create contact settings
// @route   POST /api/contact-settings
// @access  Private (super_admin, consultancy_admin)
exports.createContactSettings = async (req, res) => {
    try {
        // If setting as active, deactivate others
        if (req.body.active) {
            await ContactSettings.updateMany({}, { active: false });
        }

        const settings = await ContactSettings.create(req.body);

        res.status(201).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating contact settings',
            error: error.message
        });
    }
};

// @desc    Update contact settings
// @route   PUT /api/contact-settings/:id
// @access  Private (super_admin, consultancy_admin)
exports.updateContactSettings = async (req, res) => {
    try {
        let settings = await ContactSettings.findById(req.params.id);

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Contact settings not found'
            });
        }

        // If setting as active, deactivate others
        if (req.body.active) {
            await ContactSettings.updateMany(
                { _id: { $ne: req.params.id } },
                { active: false }
            );
        }

        settings = await ContactSettings.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating contact settings',
            error: error.message
        });
    }
};

// @desc    Delete contact settings
// @route   DELETE /api/contact-settings/:id
// @access  Private (super_admin, consultancy_admin)
exports.deleteContactSettings = async (req, res) => {
    try {
        const settings = await ContactSettings.findById(req.params.id);

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Contact settings not found'
            });
        }

        await settings.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Contact settings deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
