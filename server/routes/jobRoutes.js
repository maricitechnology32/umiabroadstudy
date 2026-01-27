const express = require('express');
const router = express.Router();
const {
    getActiveJobs,
    getJobBySlug,
    getAllJobs,
    createJob,
    updateJob,
    deleteJob
} = require('../controllers/jobController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getActiveJobs);
router.get('/:slug', getJobBySlug);

// Admin routes
router.get('/admin/all', protect, authorize('super_admin', 'consultancy_admin'), getAllJobs);
router.post('/', protect, authorize('super_admin', 'consultancy_admin'), createJob);
router.put('/:id', protect, authorize('super_admin', 'consultancy_admin'), updateJob);
router.delete('/:id', protect, authorize('super_admin', 'consultancy_admin'), deleteJob);

module.exports = router;
