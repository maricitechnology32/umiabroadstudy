const express = require('express');
const { addHoliday, getHolidays, deleteHoliday } = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public access to get list (for generators)
router.get('/', getHolidays);

// Restricted access for management
router.post('/', protect, authorize('super_admin'), addHoliday);
router.delete('/:id', protect, authorize('super_admin'), deleteHoliday);

module.exports = router;