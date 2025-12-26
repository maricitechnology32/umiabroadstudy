const Event = require('../models/Event');

// @desc    Get all events for user's consultancy
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
    try {
        const consultancyId = req.user.consultancyId;

        if (!consultancyId) {
            return res.status(400).json({ success: false, message: 'No consultancy associated with user' });
        }

        const events = await Event.find({ consultancy: consultancyId })
            .sort('date')
            .populate('createdBy', 'name');

        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add a new event
// @route   POST /api/events
// @access  Private (Admin/Manager)
exports.addEvent = async (req, res) => {
    try {
        const { title, date, endDate, type, description } = req.body;
        const consultancyId = req.user.consultancyId;

        if (!title || !date) {
            return res.status(400).json({ success: false, message: 'Title and Date are required' });
        }

        if (!consultancyId) {
            return res.status(400).json({ success: false, message: 'No consultancy associated with user' });
        }

        const event = await Event.create({
            consultancy: consultancyId,
            title,
            date,
            endDate,
            type: type || 'Other',
            description,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin/Manager)
exports.updateEvent = async (req, res) => {
    try {
        const { title, date, endDate, type, description } = req.body;
        const consultancyId = req.user.consultancyId;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Verify event belongs to user's consultancy
        if (event.consultancy.toString() !== consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { title, date, endDate, type, description },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedEvent, message: 'Event updated' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Manager)
exports.deleteEvent = async (req, res) => {
    try {
        const consultancyId = req.user.consultancyId;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Verify event belongs to user's consultancy
        if (event.consultancy.toString() !== consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Event deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
