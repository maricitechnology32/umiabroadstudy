const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} = require('../controllers/notificationController');

// All routes are protected
router.use(protect);

// Get notifications & clear all
router.route('/')
    .get(getNotifications)
    .delete(clearAllNotifications);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Single notification operations
router.route('/:id')
    .delete(deleteNotification);

router.put('/:id/read', markAsRead);

module.exports = router;
