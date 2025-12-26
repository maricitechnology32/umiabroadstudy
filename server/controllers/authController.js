const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');
const {
    logFailedLogin,
    logSuccessfulLogin,
    logAccountLocked,
    logPasswordChange,
    logAuthEvent
} = require('../middleware/auditMiddleware');

// ============================================
// ENHANCED TOKEN RESPONSE (Phase 2)
// ============================================

/**
 * Generate access token (short-lived: 15 minutes)
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // 15 minutes
    );
};

/**
 * Send token response with refresh token
 */
const sendTokenResponse = async (user, req, res) => {
    try {
        // 1. Generate short-lived access token (15 minutes)
        const accessToken = generateAccessToken(user._id);

        // 2. Generate long-lived refresh token (7 days)
        const refreshTokenData = await RefreshToken.createToken(
            user._id,
            req.ip || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        // 3. Create session
        const session = await Session.createSession(
            user._id,
            refreshTokenData.id,
            req.ip || req.connection.remoteAddress,
            req.headers['user-agent']
        );

        // 4. Cookie options for access token
        const accessTokenOptions = {
            expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        };

        // 5. Cookie options for refresh token
        const refreshTokenOptions = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        };

        // 6. Prepare user response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            subRole: user.subRole,
            consultancyId: user.consultancyId?._id || user.consultancyId
        };

        // 7. Add consultancy branding if populated
        if (user.consultancyId && typeof user.consultancyId === 'object' && user.consultancyId.name) {
            userResponse.consultancy = {
                id: user.consultancyId._id,
                name: user.consultancyId.name,
                logo: user.consultancyId.logo,
                tagline: user.consultancyId.tagline
            };
        }

        // 8. Log successful login
        await logSuccessfulLogin(user, req, refreshTokenData);

        // 9. Generate CSRF token (Phase 2D)
        const csrfToken = crypto.randomBytes(32).toString('hex');

        // 10. Set CSRF cookie (readable by JavaScript)
        res.cookie('XSRF-TOKEN', csrfToken, {
            httpOnly: false, // Must be false for frontend to read
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (match refresh token)
        });

        // 11. Send response with both tokens and CSRF
        res
            .status(200)
            .cookie('accessToken', accessToken, accessTokenOptions)
            .cookie('refreshToken', refreshTokenData.token, refreshTokenOptions)
            .json({
                success: true,
                accessToken, // Also send in body for localStorage fallback
                refreshToken: refreshTokenData.token,
                csrfToken, // Frontend must include this in headers
                user: userResponse,
                sessionId: session._id
            });

    } catch (error) {
        console.error('[AUTH] Token response error:', error.message);
        console.error('[AUTH] Stack trace:', error.stack);

        // Write full error to file for debugging
        const fs = require('fs');
        fs.appendFileSync('auth_errors.log', `\n---${new Date().toISOString()}---\nError: ${error.message}\nStack: ${error.stack}\n`);

        res.status(500).json({
            success: false,
            message: 'Error generating authentication tokens'
        });
    }
};

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * @desc    Register user (Protected - admin only)
 * @route   POST /api/auth/register
 * @access  Public (should be protected in production)
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        await sendTokenResponse(user, req, res);
    } catch (err) {
        await logAuthEvent('register_failed', null, req, 'failure', { error: err.message });
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Login user (Enhanced with lockout & audit)
 * @route   POST /api/auth/login  
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Find user with password field
        // Conditionally populate consultancyId only if it exists
        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            await logFailedLogin(email, req, 'User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Populate consultancyId only if user has one (e.g., not super_admin)
        if (user.consultancyId) {
            user = await user.populate('consultancyId', 'name logo tagline');
        }

        // CHECK 1: Account locked?
        if (user.isLocked) {
            await logAccountLocked(user, req);
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(423).json({
                success: false,
                message: `Account locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
                lockedUntil: user.lockUntil
            });
        }

        // CHECK 2: Password match?
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            // Increment failed attempts
            await user.incLoginAttempts();
            await logFailedLogin(email, req, 'Invalid password');

            // Check if just locked
            const updatedUser = await User.findById(user._id);
            if (updatedUser.isLocked) {
                await logAccountLocked(updatedUser, req);
                return res.status(423).json({
                    success: false,
                    message: 'Too many failed login attempts. Account locked for 15 minutes.',
                    lockedUntil: updatedUser.lockUntil
                });
            }

            const attemptsLeft = 5 - updatedUser.loginAttempts;
            return res.status(401).json({
                success: false,
                message: `Invalid credentials. ${attemptsLeft} attempts remaining.`,
                attemptsRemaining: attemptsLeft
            });
        }

        // SUCCESS: Reset login attempts
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Send tokens
        await sendTokenResponse(user, req, res);

    } catch (err) {
        console.error('[AUTH] Login error:', err);
        await logAuthEvent('login_error', null, req, 'failure', { error: err.message });
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (requires valid refresh token)
 */
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body || {};
        const refreshTokenCookie = req.cookies.refreshToken;

        const token = refreshToken || refreshTokenCookie;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const refreshTokenDoc = await RefreshToken.verifyToken(token);

        // Generate new access token
        const accessToken = generateAccessToken(refreshTokenDoc.userId._id);

        // Update session activity
        const session = await Session.findOne({
            refreshTokenId: refreshTokenDoc._id,
            isActive: true
        });

        if (session) {
            await session.updateActivity();
        }

        // Cookie options
        const options = {
            expires: new Date(Date.now() + 15 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        };

        res.cookie('accessToken', accessToken, options).json({
            success: true,
            accessToken
        });

    } catch (err) {
        console.error('[AUTH] Refresh token error:', err);
        res.status(401).json({
            success: false,
            message: err.message || 'Invalid refresh token'
        });
    }
};

/**
 * @desc    Revoke refresh token (logout)
 * @route   POST /api/auth/revoke
 * @access  Private
 */
exports.revokeToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const token = refreshToken || req.cookies.refreshToken;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify and get token
        const refreshTokenDoc = await RefreshToken.verifyToken(token);

        // Revoke token
        await refreshTokenDoc.revoke(
            req.ip || req.connection.remoteAddress,
            'user_logout'
        );

        // End session
        const session = await Session.findOne({
            refreshTokenId: refreshTokenDoc._id
        });

        if (session) {
            await session.end('logout');
        }

        // Log logout
        await logAuthEvent('logout', req.user, req, 'success');

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (err) {
        console.error('[AUTH] Revoke error:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id).populate('consultancyId', 'name logo tagline');
    res.status(200).json({ success: true, data: user });
};

/**
 * @desc    Log user out / clear cookie (Simple logout)
 * @route   GET /api/auth/logout
 * @access  Public
 */
exports.logout = async (req, res) => {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // If user is authenticated, log the event
    if (req.user) {
        await logAuthEvent('logout', req.user, req, 'success');
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ============================================
// PASSWORD MANAGEMENT (Existing + Enhanced)
// ============================================

/**
 * @desc    Forgot password - Send reset email
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if email exists
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">Password Reset Request</h2>
                <p>You have requested a password reset for your Japan Visa Portal account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
                <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Japan Visa Portal - Password Reset',
                html
            });

            await logAuthEvent('password_reset_request', user, req, 'success');

            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (err) {
            console.error('Email error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        // Validate new password
        if (!req.body.password || req.body.password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Reset login attempts on password reset
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        await user.save();

        await logPasswordChange(user, req, 'reset');

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            return res.status(400).json({ success: false, message: message });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Change password (for logged-in users)
 * @route   PUT /api/auth/changepassword
 * @access  Private
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Set new password
        user.password = newPassword;
        await user.save();

        await logPasswordChange(user, req, 'change');

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};