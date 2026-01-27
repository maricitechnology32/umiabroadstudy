// Audit Logging Middleware
// Tracks all security-relevant events

const AuditLog = require('../models/AuditLog');

/**
 * Log audit event helper function
 * Can be used anywhere in controllers
 */
const logAuditEvent = async (eventData) => {
    try {
        await AuditLog.log(eventData);
    } catch (error) {
        console.error('[AUDIT] Failed to log event:', error);
        // Don't throw - logging shouldn't break the app
    }
};

/**
 * Middleware to automatically log API requests
 * Selective logging for important endpoints
 */
const auditMiddleware = (req, res, next) => {
    // Only log important endpoints
    const shouldLog =
        req.path.includes('/auth/') ||
        req.path.includes('/upload') ||
        req.path.includes('/students') ||
        req.method !== 'GET'; // Log all mutations

    if (!shouldLog) {
        return next();
    }

    // Capture original res.json to intercept response
    const originalJson = res.json.bind(res);

    res.json = function (data) {
        // Log after response
        setImmediate(async () => {
            try {
                const logData = {
                    userId: req.user?.id,
                    userEmail: req.user?.email,
                    method: req.method,
                    endpoint: req.path,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    statusCode: res.statusCode,
                    status: res.statusCode < 400 ? 'success' : 'failure'
                };

                // Add action based on endpoint
                if (req.path.includes('/login')) {
                    logData.action = res.statusCode === 200 ? 'login' : 'login_failed';
                    logData.resource = 'auth';
                } else if (req.path.includes('/logout')) {
                    logData.action = 'logout';
                    logData.resource = 'auth';
                } else if (req.path.includes('/password')) {
                    logData.action = 'password_change';
                    logData.resource = 'auth';
                } else if (req.path.includes('/upload')) {
                    logData.action = 'file_upload';
                    logData.resource = 'file';
                } else if (req.path.includes('/students')) {
                    logData.action = `student_${req.method.toLowerCase()}`;
                    logData.resource = 'student';
                    logData.resourceId = req.params.id;
                }

                // Add error message if failure
                if (res.statusCode >= 400 && data && data.message) {
                    logData.errorMessage = data.message;
                }

                await AuditLog.log(logData);
            } catch (error) {
                console.error('[AUDIT] Logging error:', error);
            }
        });

        // Call original
        return originalJson(data);
    };

    next();
};

/**
 * Log specific authentication event
 * Used in auth controller
 */
const logAuthEvent = async (action, user, req, status = 'success', details = {}) => {
    const eventData = {
        userId: user?._id,
        userEmail: user?.email || req.body.email,
        action,
        resource: 'auth',
        method: req.method,
        endpoint: req.path,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status,
        details
    };

    await logAuditEvent(eventData);
};

/**
 * Log failed login attempt
 * Enhanced logging for security
 */
const logFailedLogin = async (email, req, reason = 'Invalid credentials') => {
    await logAuthEvent(
        'login_failed',
        null,
        req,
        'failure',
        { email, reason }
    );
};

/**
 * Log successful login
 */
const logSuccessfulLogin = async (user, req, refreshToken = null) => {
    await logAuthEvent(
        'login',
        user,
        req,
        'success',
        { refreshTokenId: refreshToken?._id }
    );
};

/**
 * Log account lockout
 */
const logAccountLocked = async (user, req) => {
    await logAuthEvent(
        'account_locked',
        user,
        req,
        'warning',
        {
            attempts: user.loginAttempts,
            lockUntil: user.lockUntil
        }
    );
};

/**
 * Log password change
 */
const logPasswordChange = async (user, req, type = 'change') => {
    const action = type === 'reset' ? 'password_reset_complete' : 'password_change';
    await logAuthEvent(action, user, req, 'success');
};

/**
 * Log file upload
 */
const logFileUpload = async (user, req, fileInfo) => {
    await logAuditEvent({
        userId: user._id,
        userEmail: user.email,
        action: 'file_upload',
        resource: 'file',
        method: 'POST',
        endpoint: '/api/upload',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'success',
        details: {
            filename: fileInfo.filename,
            originalName: fileInfo.originalname,
            mimetype: fileInfo.mimetype,
            size: fileInfo.size
        }
    });
};

module.exports = {
    auditMiddleware,
    logAuditEvent,
    logAuthEvent,
    logFailedLogin,
    logSuccessfulLogin,
    logAccountLocked,
    logPasswordChange,
    logFileUpload
};
