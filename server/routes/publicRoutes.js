const express = require('express');
const { getPublicConsultancyInfo, submitInquiry, getDefaultConsultancy, getPublicLandingData } = require('../controllers/publicController');

const router = express.Router();

// No 'protect' middleware here - these are public!
router.get('/landing-data', getPublicLandingData);
router.get('/consultancy/default', getDefaultConsultancy);
router.get('/consultancy/:id', getPublicConsultancyInfo);
router.post('/inquiry', submitInquiry);

module.exports = router;