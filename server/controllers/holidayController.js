const Holiday = require('../models/Holiday');

// @desc    Add a new Holiday
// @route   POST /api/holidays
// @access  Private (Super Admin)
exports.addHoliday = async (req, res) => {
    try {
        const { date, name, type } = req.body;
        
        if (!date || !name) {
            return res.status(400).json({ success: false, message: 'Date and Name are required' });
        }

        // Prevent duplicates
        const exists = await Holiday.findOne({ date });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Holiday already exists for this date' });
        }

        const holiday = await Holiday.create({ date, name, type });
        res.status(201).json({ success: true, data: holiday });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all Holidays
// @route   GET /api/holidays
// @access  Public (Everyone needs this for the generator)
exports.getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort('date');
        res.status(200).json({ success: true, count: holidays.length, data: holidays });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a Holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Super Admin)
exports.deleteHoliday = async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Holiday deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};