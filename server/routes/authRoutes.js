const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshToken,
    revokeToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    authLimiter,
    passwordResetLimiter,
    loginValidation,
    registerValidation,
    passwordChangeValidation,
    passwordResetValidation,
    emailValidation,
    handleValidationErrors
} = require('../middleware/securityMiddleware');

const router = express.Router();

// Public routes with rate limiting and validation
router.post('/register', authLimiter, registerValidation, handleValidationErrors, register);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, login);
router.get('/logout', logout);

// Token management (Phase 2)
router.post('/refresh', refreshToken); // Refresh access token
router.post('/revoke', revokeToken); // Revoke refresh token

// Protected routes
router.get('/me', protect, getMe);

// Password management with rate limiting and validation
router.post('/forgotpassword', passwordResetLimiter, emailValidation, handleValidationErrors, forgotPassword);
router.put('/resetpassword/:resettoken', passwordResetValidation, handleValidationErrors, resetPassword);
router.put('/changepassword', protect, passwordChangeValidation, handleValidationErrors, changePassword);

module.exports = router;