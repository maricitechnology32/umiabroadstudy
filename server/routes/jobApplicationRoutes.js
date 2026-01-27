const express = require('express');
const router = express.Router();
const {
    submitApplication,
    getMyApplications,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication,
    getApplicationsByJob
} = require('../controllers/jobApplicationController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/', submitApplication);

// Authenticated user routes
router.get('/my-applications', protect, getMyApplications);

// Admin routes
router.get('/', protect, authorize('super_admin', 'consultancy_admin'), getApplications);
router.get('/job/:jobId', protect, authorize('super_admin', 'consultancy_admin'), getApplicationsByJob);
router.get('/:id', protect, authorize('super_admin', 'consultancy_admin'), getApplicationById);
router.put('/:id/status', protect, authorize('super_admin', 'consultancy_admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('super_admin', 'consultancy_admin'), deleteApplication);

module.exports = router;
