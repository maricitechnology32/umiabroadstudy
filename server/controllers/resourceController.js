const Resource = require('../models/Resource');
const Consultancy = require('../models/Consultancy');
const mongoose = require('mongoose');

// @desc    Add a new resource (document)
// @route   POST /api/resources
// @access  Private (Consultancy Admin/Staff)
const addResource = async (req, res) => {
    try {
        const { name, fileUrl, fileType, category } = req.body;

        // 1. Validation
        if (!name || !fileUrl) {
            return res.status(400).json({ success: false, message: 'Name and File are required' });
        }

        // 2. Create Resource
        const resource = await Resource.create({
            name,
            fileUrl,
            fileType: fileType || 'other',
            category: category || 'document',
            consultancy: req.user.consultancyId || req.user.consultancy,
            uploadedBy: req.user._id
        });

        // 3. Real-time Notification to Students
        const io = req.app.get('io');
        if (io) {
            const room = `consultancy_${req.user.consultancyId}`;

            // 1. Emit data for real-time UI updates (e.g. list refresh)
            io.to(room).emit('new_resource', resource);

            // 2. Emit notification for the Bell/Toast
            io.to(room).emit('receive_notification', {
                id: new mongoose.Types.ObjectId(), // Generate a temp ID or save notification to DB first
                title: 'New Document',
                message: `New document uploaded: ${name}`,
                type: 'info',
                timestamp: new Date(),
                link: '/student/profile' // Link to profile where documents are
            });
        }

        res.status(201).json({ success: true, data: resource });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all resources for the logged-in user's consultancy
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
    try {
        let consultancyId;

        // Logic to determine Consultancy ID based on user role
        if (req.user.role === 'student') {
            console.log('[Resources] User is student:', req.user._id);

            // 1. Try direct link on User model
            if (req.user.consultancyId) {
                console.log('[Resources] Found consultancyId on User:', req.user.consultancyId);
                consultancyId = req.user.consultancyId;
            } else {
                console.log('[Resources] No consultancyId on User, looking up Student Profile...');

                // 2. Try looking up the Student Profile
                let student = null;
                if (req.user.studentProfileId) {
                    console.log('[Resources] Looking up student by Profile ID:', req.user.studentProfileId);
                    student = await mongoose.model('Student').findById(req.user.studentProfileId);
                }

                // 3. Fallback: Find student by User ID
                if (!student) {
                    console.log('[Resources] Fallback: Finding student by User ID:', req.user._id);
                    student = await mongoose.model('Student').findOne({ user: req.user._id });
                }

                if (student) {
                    console.log('[Resources] Found Student:', student._id, 'Consultancy:', student.consultancy);
                    consultancyId = student.consultancy;
                } else {
                    console.log('[Resources] Student profile not found for user:', req.user._id);
                }
            }
        } else {
            console.log('[Resources] User is Staff/Admin:', req.user.role);
            // For Admins/Staff
            consultancyId = req.user.consultancyId || req.user.consultancy;
        }

        console.log('[Resources] Resolved Consultancy ID:', consultancyId);

        if (!consultancyId) {
            console.error('[Resources] Error: Consultancy ID not found for user:', req.user._id);
            return res.status(400).json({ success: false, message: 'Consultancy ID not found for user' });
        }

        const query = { consultancy: consultancyId };

        // STRICT SECURITY: Handle 'admin_only' visibility
        const isAdmin = req.user.role === 'consultancy_admin';

        if (req.query.category) {
            // If requesting admin_only, enforce role check
            if (req.query.category === 'admin_only') {
                if (!isAdmin) {
                    return res.status(403).json({ success: false, message: 'Access denied' });
                }
                query.category = 'admin_only';
            } else {
                query.category = req.query.category;
            }
        } else {
            // If no category specified (fetch all), exclude admin_only for non-admins
            if (!isAdmin) {
                query.category = { $ne: 'admin_only' };
            }
        }

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: resources.length, data: resources });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin/Staff)
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        // Check ownership
        if (resource.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await resource.deleteOne();

        res.status(200).json({ success: true, message: 'Resource deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update resource with filled form (Receptionist/Staff workflow)
// @route   PUT /api/resources/:id/fill
// @access  Private (Staff)
const updateFilledForm = async (req, res) => {
    try {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ success: false, message: 'Filled form file URL is required' });
        }

        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        // Check ownership
        if (resource.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Only allow updating templates or rejected forms
        if (resource.workflowStatus !== 'template' && resource.workflowStatus !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: `Cannot update form with status: ${resource.workflowStatus}`
            });
        }

        // Preserve original template if not already preserved
        if (!resource.templateUrl && resource.fileUrl) {
            resource.templateUrl = resource.fileUrl;
        }

        // Update with filled version
        resource.fileUrl = fileUrl;
        resource.workflowStatus = 'filled';

        await resource.save();

        // Real-time notification to admins
        const io = req.app.get('io');
        if (io) {
            const room = `consultancy_${req.user.consultancyId}`;
            io.to(room).emit('form_updated', resource);
            io.to(room).emit('receive_notification', {
                id: new mongoose.Types.ObjectId(),
                title: 'Form Filled',
                message: `${resource.name} has been filled and is ready for verification`,
                type: 'info',
                timestamp: new Date()
            });
        }

        res.status(200).json({ success: true, data: resource });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Verify or reject a filled form (Admin workflow)
// @route   PUT /api/resources/:id/verify
// @access  Private (Admin/Manager)
const verifyForm = async (req, res) => {
    try {
        const { status, message } = req.body;

        // Validate status
        if (!status || !['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either "verified" or "rejected"'
            });
        }

        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        // Check ownership
        if (resource.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Only allow verifying filled forms
        if (resource.workflowStatus !== 'filled') {
            return res.status(400).json({
                success: false,
                message: `Cannot verify form with status: ${resource.workflowStatus}`
            });
        }

        // Update verification details
        resource.workflowStatus = status;
        resource.verificationMessage = message || null;
        resource.verifiedBy = req.user._id;
        resource.verifiedAt = new Date();

        await resource.save();

        // Populate verifiedBy before sending response
        await resource.populate('verifiedBy', 'name email');

        // Real-time notification to staff
        const io = req.app.get('io');
        if (io) {
            const room = `consultancy_${req.user.consultancyId}`;
            io.to(room).emit('form_verified', resource);
            io.to(room).emit('receive_notification', {
                id: new mongoose.Types.ObjectId(),
                title: status === 'verified' ? 'Form Verified' : 'Form Rejected',
                message: `${resource.name}: ${message || 'No message provided'}`,
                type: status === 'verified' ? 'success' : 'warning',
                timestamp: new Date()
            });
        }

        res.status(200).json({ success: true, data: resource });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    addResource,
    getResources,
    deleteResource,
    updateFilledForm,
    verifyForm
};
