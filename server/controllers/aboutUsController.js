const AboutUs = require('../models/AboutUs');

// @desc    Get active About Us content (Public)
// @route   GET /api/about
// @access  Public
exports.getAboutUs = async (req, res) => {
    try {
        const aboutUs = await AboutUs.findOne({ isActive: true });

        // Return fallback default data if no About Us content exists
        if (!aboutUs) {
            return res.status(200).json({
                success: true,
                data: {
                    title: 'About Us',
                    description: 'We are dedicated to providing excellent visa consulting services for Japan.',
                    mission: 'We are dedicated to helping students achieve their dreams of studying and working in Japan.',
                    vision: 'To be the leading visa consultancy connecting Nepal and Japan.',
                    values: [],
                    teamMembers: [],
                    stats: [
                        { label: 'Students Helped', value: '1000+' },
                        { label: 'Success Rate', value: '98%' },
                        { label: 'Years Experience', value: '10+' },
                        { label: 'Partner Schools', value: '50+' }
                    ],
                    isActive: true,
                    _isDefault: true // Flag to indicate this is default data
                }
            });
        }

        res.status(200).json({
            success: true,
            data: aboutUs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get About Us content for admin (All records)
// @route   GET /api/about/admin
// @access  Private (Super Admin)
exports.getAboutUsAdmin = async (req, res) => {
    try {
        const aboutUs = await AboutUs.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: aboutUs.length,
            data: aboutUs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create About Us content
// @route   POST /api/about
// @access  Private (Super Admin)
exports.createAboutUs = async (req, res) => {
    try {
        const aboutUs = await AboutUs.create(req.body);

        res.status(201).json({
            success: true,
            data: aboutUs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create About Us content',
            error: error.message
        });
    }
};

// @desc    Update About Us content
// @route   PUT /api/about/:id
// @access  Private (Super Admin)
exports.updateAboutUs = async (req, res) => {
    try {
        let aboutUs = await AboutUs.findById(req.params.id);

        if (!aboutUs) {
            return res.status(404).json({
                success: false,
                message: 'About Us content not found'
            });
        }

        aboutUs = await AboutUs.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: aboutUs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update About Us content',
            error: error.message
        });
    }
};

// @desc    Delete About Us content
// @route   DELETE /api/about/:id
// @access  Private (Super Admin)
exports.deleteAboutUs = async (req, res) => {
    try {
        const aboutUs = await AboutUs.findById(req.params.id);

        if (!aboutUs) {
            return res.status(404).json({
                success: false,
                message: 'About Us content not found'
            });
        }

        await aboutUs.deleteOne();

        res.status(200).json({
            success: true,
            message: 'About Us content deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Add team member
// @route   POST /api/about/:id/team
// @access  Private (Super Admin)
exports.addTeamMember = async (req, res) => {
    try {
        const aboutUs = await AboutUs.findById(req.params.id);

        if (!aboutUs) {
            return res.status(404).json({
                success: false,
                message: 'About Us content not found'
            });
        }

        aboutUs.teamMembers.push(req.body);
        await aboutUs.save();

        res.status(200).json({
            success: true,
            data: aboutUs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to add team member',
            error: error.message
        });
    }
};

// @desc    Remove team member
// @route   DELETE /api/about/:id/team/:teamMemberId
// @access  Private (Super Admin)
exports.removeTeamMember = async (req, res) => {
    try {
        const aboutUs = await AboutUs.findById(req.params.id);

        if (!aboutUs) {
            return res.status(404).json({
                success: false,
                message: 'About Us content not found'
            });
        }

        aboutUs.teamMembers = aboutUs.teamMembers.filter(
            member => member._id.toString() !== req.params.teamMemberId
        );

        await aboutUs.save();

        res.status(200).json({
            success: true,
            data: aboutUs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove team member',
            error: error.message
        });
    }
};
