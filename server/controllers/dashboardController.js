const Student = require('../models/Student');
const Consultancy = require('../models/Consultancy');
const mongoose = require('mongoose');

// @desc    Get Dashboard Statistics (Counts, Recent Activity)
// @route   GET /api/dashboard/stats
// @access  Private (Consultancy Admin/Manager)
// @desc    Get Dashboard Statistics (Counts, Recent Activity)
// @route   GET /api/dashboard/stats
// @access  Private (Consultancy Admin/Manager)
exports.getDashboardStats = async (req, res) => {
    try {
        const consultancyId = new mongoose.Types.ObjectId(req.user.consultancyId);

        // Aggregation Pipeline to Filter by User Role 'student' & Get All Stats in One Go
        const stats = await Student.aggregate([
            // 1. Filter by Consultancy
            { $match: { consultancy: consultancyId } },

            // 2. Join with Users collection to check Role
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },

            // 3. Filter ONLY Students
            { $match: { 'userDetails.role': 'student' } },

            // 4. Use Facets to get multiple stats in parallel
            {
                $facet: {
                    // Total Count
                    totalStudents: [{ $count: "count" }],

                    // Group by Profile Status (Lead, Draft, etc.)
                    statusCounts: [
                        { $group: { _id: '$profileStatus', count: { $sum: 1 } } }
                    ],

                    // Group by Visa Processing Info Status
                    visaStatusCounts: [
                        { $group: { _id: '$processingInfo.visaStatus', count: { $sum: 1 } } }
                    ],

                    // Group by Application Status (unwind array)
                    applicationCounts: [
                        { $unwind: { path: '$applications', preserveNullAndEmptyArrays: false } }, // Only if apps exist
                        { $group: { _id: '$applications.status', count: { $sum: 1 } } }
                    ],

                    // Recent Activity (Top 5 updated)
                    recentActivity: [
                        { $sort: { updatedAt: -1 } },
                        { $limit: 5 },
                        {
                            $project: {
                                personalInfo: 1,
                                profileStatus: 1,
                                updatedAt: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0];

        // --- Post-Processing ---

        const totalStudents = result.totalStudents[0]?.count || 0;

        // Convert Arrays to Objects for Frontend
        const statusCounts = result.statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        const visaStatusCounts = result.visaStatusCounts.reduce((acc, curr) => {
            acc[curr._id || 'None'] = curr.count;
            return acc;
        }, {});

        const applicationStats = result.applicationCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // Calculate "Active Applications" & "Success Rate"
        const visaGranted = visaStatusCounts['Visa Granted'] || 0;
        const visaRejected = visaStatusCounts['Visa Rejected'] || 0;

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
                visaStatusCounts,
                applicationStats,
                recentActivity: result.recentActivity
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching dashboard stats' });
    }
};
