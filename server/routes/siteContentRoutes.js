const express = require('express');
const { getSiteContent, updateSiteContent } = require('../controllers/siteContentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getSiteContent)
    .put(protect, authorize('super_admin', 'consultancy_admin', 'admin'), updateSiteContent); // Allow admin roles to edit

module.exports = router;
