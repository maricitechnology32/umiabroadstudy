const express = require('express');
const router = express.Router();
const { getNRBExchangeRate } = require('../controllers/exchangeRateController');

/**
 * @route   GET /api/exchange-rate/nrb
 * @desc    Fetch USD/NPR selling rate from Nepal Rastra Bank (proxy to avoid CORS)
 * @access  Public
 */
router.get('/nrb', getNRBExchangeRate);

module.exports = router;
