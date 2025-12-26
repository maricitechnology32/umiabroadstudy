const express = require('express');
const { getEvents, addEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get events - accessible by all authenticated users of the consultancy
router.get('/', getEvents);

// Create, Update, Delete - only for admin/manager
router.post('/', authorize('consultancy_admin', 'consultancy_staff'), addEvent);
router.put('/:id', authorize('consultancy_admin', 'consultancy_staff'), updateEvent);
router.delete('/:id', authorize('consultancy_admin', 'consultancy_staff'), deleteEvent);

module.exports = router;
