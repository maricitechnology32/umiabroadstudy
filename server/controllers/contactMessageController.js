const ContactMessage = require('../models/ContactMessage');

// @desc    Submit contact message (public)
// @route   POST /api/contact-messages
// @access  Public
exports.submitContactMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Get IP address
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const contactMessage = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message,
            ipAddress
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: {
                id: contactMessage._id,
                name: contactMessage.name,
                email: contactMessage.email
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error submitting message',
            error: error.message
        });
    }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact-messages
// @access  Private (super_admin, consultancy_admin)
exports.getContactMessages = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        // Build query
        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const messages = await ContactMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count
        const count = await ContactMessage.countDocuments(query);

        res.status(200).json({
            success: true,
            count: messages.length,
            total: count,
            pagination: {
                page: Number(page),
                pages: Math.ceil(count / limit),
                limit: Number(limit)
            },
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single contact message
// @route   GET /api/contact-messages/:id
// @access  Private (super_admin, consultancy_admin)
exports.getContactMessageById = async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Auto-mark as read when viewing
        if (message.status === 'new') {
            message.status = 'read';
            await message.save();
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update message status
// @route   PUT /api/contact-messages/:id/status
// @access  Private (super_admin, consultancy_admin)
exports.updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['new', 'read', 'replied', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        message.status = status;
        await message.save();

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contact-messages/:id
// @access  Private (super_admin, consultancy_admin)
exports.deleteContactMessage = async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
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
