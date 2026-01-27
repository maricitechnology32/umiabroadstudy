const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers } = require('../controllers/subscriberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(subscribe)
    .get(protect, authorize('super_admin', 'consultancy_admin'), getSubscribers);

module.exports = router;
