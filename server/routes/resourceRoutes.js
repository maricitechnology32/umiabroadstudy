const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { addResource, getResources, deleteResource } = require('../controllers/resourceController');

router.route('/')
    .post(protect, authorize('consultancy_admin', 'staff'), addResource)
    .get(protect, getResources);

router.route('/:id')
    .delete(protect, authorize('consultancy_admin', 'staff'), deleteResource);

module.exports = router;
