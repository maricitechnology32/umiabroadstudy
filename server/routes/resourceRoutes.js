const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { addResource, getResources, deleteResource, updateFilledForm, verifyForm } = require('../controllers/resourceController');

router.route('/')
    .post(protect, authorize('consultancy_admin', 'staff'), addResource)
    .get(protect, getResources);

router.route('/:id')
    .delete(protect, authorize('consultancy_admin', 'staff'), deleteResource);

// Form workflow routes
router.route('/:id/fill')
    .put(protect, authorize('consultancy_admin', 'consultancy_staff', 'counselor'), updateFilledForm);

router.route('/:id/verify')
    .put(protect, authorize('consultancy_admin', 'manager'), verifyForm);

module.exports = router;
