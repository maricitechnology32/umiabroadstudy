const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes are protected
router.use(protect);

router.get('/stats', authorize('consultancy_admin', 'manager', 'counselor'), getDashboardStats);

module.exports = router;
