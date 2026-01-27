const express = require('express');
const router = express.Router();
const {
    submitContactMessage,
    getContactMessages,
    getContactMessageById,
    updateMessageStatus,
    deleteContactMessage
} = require('../controllers/contactMessageController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/', submitContactMessage);

// Admin routes
router.get('/', protect, authorize('super_admin', 'consultancy_admin'), getContactMessages);
router.get('/:id', protect, authorize('super_admin', 'consultancy_admin'), getContactMessageById);
router.put('/:id/status', protect, authorize('super_admin', 'consultancy_admin'), updateMessageStatus);
router.delete('/:id', protect, authorize('super_admin', 'consultancy_admin'), deleteContactMessage);

module.exports = router;
