const Student = require('../models/Student');
const Consultancy = require('../models/Consultancy');
const mongoose = require('mongoose');

// @desc    Get Dashboard Statistics (Counts, Recent Activity)
// @route   GET /api/dashboard/stats
// @access  Private (Consultancy Admin/Manager)
exports.getDashboardStats = async (req, res) => {
    try {
        const consultancyId = req.user.consultancyId;

        // 1. Total Students
        const totalStudents = await Student.countDocuments({ consultancy: consultancyId });

        // 2. Students by Profile Status (Lead, Draft, Submitted, etc.)
        const statusAggregation = await Student.aggregate([
            { $match: { consultancy: new mongoose.Types.ObjectId(consultancyId) } },
            { $group: { _id: '$profileStatus', count: { $sum: 1 } } }
        ]);

        // Convert array to object for easier frontend access
        // e.g. { lead: 5, submitted: 10 }
        const statusCounts = statusAggregation.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // 3. Visa / Application Status (Unwinding applications)
        // We want to know how many are "Visa Granted", "COE Received", etc.
        const applicationAggregation = await Student.aggregate([
            { $match: { consultancy: new mongoose.Types.ObjectId(consultancyId) } },
            { $unwind: '$applications' }, // Deconstruct applications array
            { $group: { _id: '$applications.status', count: { $sum: 1 } } }
        ]);

        const applicationStats = applicationAggregation.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // 4. Visa Processing Status (New global tracking)
        const visaStatusAggregation = await Student.aggregate([
            { $match: { consultancy: new mongoose.Types.ObjectId(consultancyId) } },
            { $group: { _id: '$processingInfo.visaStatus', count: { $sum: 1 } } }
        ]);

        const visaStatusCounts = visaStatusAggregation.reduce((acc, curr) => {
            acc[curr._id || 'None'] = curr.count;
            return acc;
        }, {});

        // 4. Recent Students (Last 5 updated)
        const recentStudents = await Student.find({ consultancy: consultancyId })
            .select('personalInfo profileStatus updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .limit(5);

        // 5. Calculate "Visa Success Rate"
        // Use the new visaStatusCounts for accurate top-level metrics
        const visaGranted = visaStatusCounts['Visa Granted'] || 0;
        const visaRejected = visaStatusCounts['Visa Rejected'] || 0;

        // Active Applications: Applied for COE, COE Received, Visa Applied
        const activeApplications = (visaStatusCounts['Applied for COE'] || 0) +
            (visaStatusCounts['COE Received'] || 0) +
            (visaStatusCounts['Visa Applied'] || 0);

        const totalDecisions = visaGranted + visaRejected;
        const successRate = totalDecisions > 0 ? Math.round((visaGranted / totalDecisions) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalStudents,
                    activeApplications,
                    visaGranted,
                    successRate
                },
                statusCounts,
                visaStatusCounts, // New Visa Status Aggregation
                applicationStats, // Granular breakdown
                recentActivity: recentStudents
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching dashboard stats' });
    }
};
