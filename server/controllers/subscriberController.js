const Subscriber = require('../models/Subscriber');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email'
            });
        }

        // Check if already subscribed
        const exists = await Subscriber.findOne({ email });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed'
            });
        }

        const subscriber = await Subscriber.create({ email });

        res.status(201).json({
            success: true,
            data: subscriber,
            message: 'Successfully subscribed to newsletter!'
        });
    } catch (error) {
        // Mongoose duplicate key error (fallback)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all subscribers (Admin)
// @route   GET /api/subscribe
// @access  Private (Admin)
exports.getSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
