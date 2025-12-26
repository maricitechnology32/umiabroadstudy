const express = require('express');
const router = express.Router();
const { generateSop } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // Optional: Protect this route

// POST /api/ai/generate-sop
router.post('/generate-sop', protect, generateSop);

module.exports = router;