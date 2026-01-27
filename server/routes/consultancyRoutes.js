const express = require('express');
const { createConsultancy, getConsultancies, updateConsultancy } = require('../controllers/consultancyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(authorize('super_admin'), getConsultancies)
    .post(authorize('super_admin'), createConsultancy);

router.route('/:id')
    .put(authorize('super_admin', 'consultancy_admin'), updateConsultancy);

module.exports = router;