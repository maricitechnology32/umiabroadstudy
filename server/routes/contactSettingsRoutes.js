const express = require('express');
const router = express.Router();
const {
    getContactSettings,
    getAllContactSettings,
    createContactSettings,
    updateContactSettings,
    deleteContactSettings
} = require('../controllers/contactSettingsController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getContactSettings);

// Admin routes
router.get('/admin/all', protect, authorize('super_admin', 'consultancy_admin'), getAllContactSettings);
router.post('/', protect, authorize('super_admin', 'consultancy_admin'), createContactSettings);
router.put('/:id', protect, authorize('super_admin', 'consultancy_admin'), updateContactSettings);
router.delete('/:id', protect, authorize('super_admin', 'consultancy_admin'), deleteContactSettings);

module.exports = router;
