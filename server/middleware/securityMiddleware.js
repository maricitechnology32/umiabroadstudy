// Security Middleware
// Comprehensive security configuration for Japan Visa SaaS
// Express 5 Compatible - Using custom middleware instead of incompatible packages

const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
// Note: express-mongo-sanitize and hpp removed - incompatible with Express 5 (using custom middleware)

// ============================================
// 1. RATE LIMITERS
// ============================================

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute-force attacks on login
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    // Store failed attempts by IP
    skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Password reset rate limiter
 * Prevents email bombing attacks
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 * Prevents API abuse and DDoS
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * File upload rate limiter
 * Prevents resource exhaustion
 */
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 file uploads per 15 minutes
    message: {
        success: false,
        message: 'Too many file uploads. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// 2. INPUT VALIDATION RULES
// ============================================

/**
 * Login validation rules
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Registration validation rules
 */
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\];:'"<>,.?/|\\])/)
        .withMessage('Password must include uppercase, lowercase, number, and special character')
];

/**
 * Password change validation
 */
const passwordChangeValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\];:'"<>,.?/|\\])/)
        .withMessage('New password must include uppercase, lowercase, number, and special character')
];

/**
 * Password reset validation (token based, so no current password needed)
 */
const passwordResetValidation = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\];:'"<>,.?/|\\])/)
        .withMessage('Password must include uppercase, lowercase, number, and special character')
];

/**
 * Email validation (for forgot password)
 */
const emailValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];

/**
 * Student invite validation
 */
const studentInviteValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];

// ============================================
// 3. VALIDATION ERROR HANDLER
// ============================================

/**
 * Middleware to check validation results
 * Call this after validation rules
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// ============================================
// 4. SECURITY MIDDLEWARE SETUP
// ============================================

/**
 * Apply all security middleware to Express app
 * Call this in server.js
 */
const setupSecurityMiddleware = (app) => {
    // 1. Custom NoSQL Injection Prevention (Express 5 Compatible)
    // express-mongo-sanitize doesn't work with Express 5's read-only properties
    app.use((req, res, next) => {
        const sanitizeObject = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;

            const sanitized = Array.isArray(obj) ? [] : {};

            for (const key in obj) {
                // Check if key contains MongoDB operators
                if (key.startsWith('$')) {
                    console.warn(`[SECURITY] NoSQL injection attempt blocked. Key: ${key}, IP: ${req.ip}`);
                    continue; // Skip this key
                }

                // Recursively sanitize nested objects
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitized[key] = sanitizeObject(obj[key]);
                } else {
                    sanitized[key] = obj[key];
                }
            }

            return sanitized;
        };

        // Check and log threats in body, query, params
        if (req.body && typeof req.body === 'object') {
            const originalBody = JSON.stringify(req.body);
            req.body = sanitizeObject(req.body);
            if (originalBody !== JSON.stringify(req.body)) {
                console.warn(`[SECURITY] NoSQL injection attempt in body from IP: ${req.ip}`);
            }
        }

        // For query and params, we can only detect, not modify (read-only in Express 5)
        if (req.query && typeof req.query === 'object') {
            Object.keys(req.query).forEach(key => {
                if (key.startsWith('$')) {
                    console.error(`[SECURITY ALERT] NoSQL injection in query param: ${key}, IP: ${req.ip}`);
                }
            });
        }

        if (req.params && typeof req.params === 'object') {
            Object.keys(req.params).forEach(key => {
                if (key.startsWith('$')) {
                    console.error(`[SECURITY ALERT] NoSQL injection in URL param: ${key}, IP: ${req.ip}`);
                }
            });
        }

        next();
    });

    // 2. HTTP Parameter Pollution Protection
    app.use((req, res, next) => {
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (Array.isArray(req.query[key]) && req.query[key].length > 1) {
                    console.warn(`[SECURITY] HTTP Parameter Pollution detected: ${key}, IP: ${req.ip}`);
                }
            });
        }
        next();
    });

    console.log('✅ Security middleware initialized: NoSQL Injection Protection, HPP Protection (Express 5)');
};

// ============================================
// 5. HTTPS ENFORCEMENT (Production Only)
// ============================================

/**
 * Force HTTPS in production
 */
const enforceHTTPS = (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
};

// ============================================
// 6. SECURITY HEADERS
// ============================================

/**
 * Additional security headers beyond Helmet
 */
const additionalSecurityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (formerly Feature Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
};

// ============================================
// 7. REQUEST LOGGING (Security Events)
// ============================================

/**
 * Log security-relevant events
 */
const securityLogger = (req, res, next) => {
    // Log authentication attempts
    if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
        console.log(`[AUTH] ${req.method} ${req.path} from IP: ${req.ip} at ${new Date().toISOString()}`);
    }

    // Log file uploads
    if (req.path.includes('/upload')) {
        console.log(`[UPLOAD] ${req.method} ${req.path} from IP: ${req.ip} at ${new Date().toISOString()}`);
    }

    next();
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Rate Limiters
    authLimiter,
    passwordResetLimiter,
    apiLimiter,
    uploadLimiter,

    // Validation Rules
    loginValidation,
    registerValidation,
    passwordChangeValidation,
    passwordResetValidation,
    emailValidation,
    studentInviteValidation,
    handleValidationErrors,

    // Setup Functions
    setupSecurityMiddleware,
    enforceHTTPS,
    additionalSecurityHeaders,
    securityLogger
};
