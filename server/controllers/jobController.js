const Job = require('../models/Job');

// @desc    Get active jobs (public)
// @route   GET /api/jobs
// @access  Public
exports.getActiveJobs = async (req, res) => {
    try {
        const { department, jobType, location, search, page = 1, limit = 10 } = req.query;

        // Build query
        const query = { status: 'active' };

        if (department && department !== 'all') query.department = department;
        if (jobType && jobType !== 'all') query.jobType = jobType;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('postedBy', 'name');

        const count = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            count: jobs.length,
            total: count,
            pagination: {
                page: Number(page),
                pages: Math.ceil(count / limit),
                limit: Number(limit)
            },
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get job by slug (public)
// @route   GET /api/jobs/:slug
// @access  Public
exports.getJobBySlug = async (req, res) => {
    try {
        const job = await Job.findOne({ slug: req.params.slug, status: 'active' })
            .populate('postedBy', 'name');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Increment view count
        job.viewCount += 1;
        await job.save();

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all jobs (admin)
// @route   GET /api/jobs/admin/all
// @access  Private (super_admin, consultancy_admin)
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name');

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (super_admin, consultancy_admin)
exports.createJob = async (req, res) => {
    try {
        req.body.postedBy = req.user.id;
        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        console.error('Job creation error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error creating job',
            errors: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : undefined
        });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (super_admin, consultancy_admin)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating job',
            error: error.message
        });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (super_admin, consultancy_admin)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully',
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
