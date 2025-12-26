const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Some actions may not have a user (e.g., failed login)
    },
    userEmail: {
        type: String,
        required: false
    },

    // Action Details
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'login_failed',
            'password_change',
            'password_reset_request',
            'password_reset_complete',
            'account_locked',
            'account_unlocked',
            'profile_update',
            'file_upload',
            'file_delete',
            'student_create',
            'student_update',
            'student_delete',
            'role_change',
            'permission_change',
            'api_access'
        ]
    },

    resource: {
        type: String,
        required: false // e.g., 'auth', 'student', 'file', 'user'
    },

    resourceId: {
        type: String,
        required: false // The ID of the resource being acted upon
    },

    // Request Details
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        required: false
    },

    endpoint: {
        type: String,
        required: false // e.g., '/api/auth/login'
    },

    // Network Information
    ip: {
        type: String,
        required: true
    },

    userAgent: {
        type: String,
        required: false
    },

    // Result
    status: {
        type: String,
        enum: ['success', 'failure', 'warning'],
        default: 'success'
    },

    statusCode: {
        type: Number, // HTTP status code
        required: false
    },

    // Additional Context
    details: {
        type: mongoose.Schema.Types.Mixed, // Flexible object for additional data
        required: false
    },

    errorMessage: {
        type: String,
        required: false
    },

    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false // Using custom timestamp field
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ ip: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // For chronological queries

// TTL Index - Auto-delete logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to log an action
auditLogSchema.statics.log = async function (logData) {
    try {
        const log = new this(logData);
        await log.save();
        return log;
    } catch (error) {
        console.error('[AUDIT LOG ERROR]', error);
        // Don't throw - logging failures shouldn't break the app
    }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function (userId, limit = 50) {
    return this.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
};

// Static method to get failed login attempts
auditLogSchema.statics.getFailedLogins = async function (limit = 100) {
    return this.find({ action: 'login_failed' })
        .sort({ timestamp: -1 })
        .limit(limit);
};

// Static method to get recent activity
auditLogSchema.statics.getRecentActivity = async function (hours = 24, limit = 100) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.find({ timestamp: { $gte: since } })
        .sort({ timestamp: -1 })
        .limit(limit);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
