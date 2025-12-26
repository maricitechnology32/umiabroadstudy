const express = require('express');
const { addStaff, getStaff, removeStaff } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);
// Only Consultancy Admins can manage staff
router.use(authorize('consultancy_admin'));

router.route('/')
    .get(getStaff)
    .post(addStaff);

router.route('/:id')
    .delete(removeStaff);

module.exports = router;