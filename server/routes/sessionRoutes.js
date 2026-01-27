const express = require('express');
const {
    getMySessions,
    getSession,
    revokeSession,
    revokeAllSessions,
    getSessionStats,
    cleanupSessions
} = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User session management
router.get('/me', getMySessions); // View my active sessions
router.get('/:id', getSession); // View specific session
router.delete('/:id', revokeSession); // Logout from specific device
router.delete('/all/remove', revokeAllSessions); // Logout from all other devices

// Admin routes
router.get('/admin/stats', authorize('admin', 'consultancy_admin'), getSessionStats);
router.post('/admin/cleanup', authorize('admin', 'consultancy_admin'), cleanupSessions);

module.exports = router;
