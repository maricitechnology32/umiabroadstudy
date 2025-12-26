const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

// @desc    Submit job application (public)
// @route   POST /api/job-applications
// @access  Public
exports.submitApplication = async (req, res) => {
    try {
        const { job, applicantName, email, phone, resumeUrl, coverLetter, linkedinUrl, portfolioUrl } = req.body;

        // Check if job exists and is active
        const jobExists = await Job.findById(job);
        if (!jobExists || jobExists.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Job not found or no longer active'
            });
        }

        // Check if user has already applied
        const existingApplication = await JobApplication.findOne({ job, email });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this position'
            });
        }

        const application = await JobApplication.create({
            job,
            applicantName,
            email,
            phone,
            resumeUrl,
            coverLetter,
            linkedinUrl,
            portfolioUrl
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully! We will review your application and get back to you soon.',
            data: {
                id: application._id,
                jobTitle: jobExists.title
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error submitting application',
            error: error.message
        });
    }
};

// @desc    Get my applications (authenticated user)
// @route   GET /api/job-applications/my-applications
// @access  Private
exports.getMyApplications = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const applications = await JobApplication.find({ email: userEmail })
            .sort({ createdAt: -1 })
            .populate('job', 'title department location slug status');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};


// @desc    Get all applications (admin)
// @route   GET /api/job-applications
// @access  Private (super_admin, consultancy_admin)
exports.getApplications = async (req, res) => {
    try {
        const { status, search, jobId, page = 1, limit = 20 } = req.query;

        // Build query
        const query = {};
        if (status && status !== 'all') query.status = status;
        if (jobId) query.job = jobId;
        if (search) {
            query.$or = [
                { applicantName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const applications = await JobApplication.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('job', 'title department')
            .populate('reviewedBy', 'name');

        const count = await JobApplication.countDocuments(query);

        res.status(200).json({
            success: true,
            count: applications.length,
            total: count,
            pagination: {
                page: Number(page),
                pages: Math.ceil(count / limit),
                limit: Number(limit),
                total: count
            },
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single application
// @route   GET /api/job-applications/:id
// @access  Private (super_admin, consultancy_admin)
exports.getApplicationById = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id)
            .populate('job')
            .populate('reviewedBy', 'name');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Auto-mark as reviewed if status is new
        if (application.status === 'new') {
            application.status = 'reviewed';
            application.reviewedAt = new Date();
            application.reviewedBy = req.user.id;
            await application.save();
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update application status
// @route   PUT /api/job-applications/:id/status
// @access  Private (super_admin, consultancy_admin)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!['new', 'reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        application.status = status;
        if (notes) application.notes = notes;
        application.reviewedAt = new Date();
        application.reviewedBy = req.user.id;

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

// @desc    Delete application
// @route   DELETE /api/job-applications/:id
// @access  Private (super_admin, consultancy_admin)
exports.deleteApplication = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        await application.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Application deleted successfully',
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

// @desc    Get applications by job
// @route   GET /api/job-applications/job/:jobId
// @access  Private (super_admin, consultancy_admin)
exports.getApplicationsByJob = async (req, res) => {
    try {
        const applications = await JobApplication.find({ job: req.params.jobId })
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'name');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
