// CSRF Protection Middleware
// Protection against Cross-Site Request Forgery attacks

const crypto = require('crypto');

/**
 * Generate CSRF token
 */
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware to attach CSRF token to response
 * Call this for routes that need CSRF protection (e.g., login)
 */
const attachCSRFToken = (req, res, next) => {
    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Store in cookie (accessible to JavaScript for reading)
    res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // Must be false so frontend can read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Also attach to response locals for immediate use
    res.locals.csrfToken = csrfToken;

    next();
};

/**
 * Middleware to validate CSRF token
 * Apply to all state-changing routes (POST, PUT, DELETE, PATCH)
 */
const validateCSRFToken = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF for certain safe routes
    const skipPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/forgotpassword'
    ];

    if (skipPaths.includes(req.path)) {
        return next();
    }

    // Get CSRF token from header
    const headerToken = req.headers['x-csrf-token'] ||
        req.headers['x-xsrf-token'];

    // Get CSRF token from cookie
    const cookieToken = req.cookies['XSRF-TOKEN'];

    // Validate
    if (!headerToken) {
        console.warn(`[CSRF] Missing CSRF token in header from IP: ${req.ip}, Path: ${req.path}`);
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing',
            code: 'CSRF_MISSING'
        });
    }

    if (!cookieToken) {
        console.warn(`[CSRF] Missing CSRF cookie from IP: ${req.ip}`);
        return res.status(403).json({
            success: false,
            message: 'CSRF cookie missing',
            code: 'CSRF_COOKIE_MISSING'
        });
    }

    if (headerToken !== cookieToken) {
        console.error(`[CSRF ATTACK] Token mismatch from IP: ${req.ip}, User: ${req.user?.email || 'Unknown'}`);
        return res.status(403).json({
            success: false,
            message: 'CSRF token validation failed',
            code: 'CSRF_INVALID'
        });
    }

    // Valid - proceed
    next();
};

/**
 * Strict CSRF validation (no path exceptions)
 * Use for highly sensitive operations
 */
const strictCSRFValidation = (req, res, next) => {
    const headerToken = req.headers['x-csrf-token'] ||
        req.headers['x-xsrf-token'];
    const cookieToken = req.cookies['XSRF-TOKEN'];

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        console.error(`[CSRF STRICT] Validation failed from IP: ${req.ip}`);
        return res.status(403).json({
            success: false,
            message: 'CSRF validation failed',
            code: 'CSRF_INVALID'
        });
    }

    next();
};

/**
 * Helper to include CSRF token in JSON response
 * Usage: res.json(withCSRF({ data: ... }, res))
 */
const withCSRF = (data, res) => {
    return {
        ...data,
        csrfToken: res.locals.csrfToken || res.cookies['XSRF-TOKEN']
    };
};

module.exports = {
    generateCSRFToken,
    attachCSRFToken,
    validateCSRFToken,
    strictCSRFValidation,
    withCSRF
};
