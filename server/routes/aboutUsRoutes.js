const express = require('express');
const {
    getAboutUs,
    getAboutUsAdmin,
    createAboutUs,
    updateAboutUs,
    deleteAboutUs,
    addTeamMember,
    removeTeamMember
} = require('../controllers/aboutUsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - no authentication required
router.get('/', getAboutUs);

// Admin routes - require super_admin or consultancy_admin authorization
router.get('/admin', protect, authorize('super_admin', 'consultancy_admin'), getAboutUsAdmin);
router.post('/', protect, authorize('super_admin', 'consultancy_admin'), createAboutUs);
router.put('/:id', protect, authorize('super_admin', 'consultancy_admin'), updateAboutUs);
router.delete('/:id', protect, authorize('super_admin', 'consultancy_admin'), deleteAboutUs);

// Team member management
router.post('/:id/team', protect, authorize('super_admin', 'consultancy_admin'), addTeamMember);
router.delete('/:id/team/:teamMemberId', protect, authorize('super_admin', 'consultancy_admin'), removeTeamMember);

module.exports = router;
