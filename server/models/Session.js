const mongoose = require('mongoose');
const UAParser = require('ua-parser-js'); // Device detection for session tracking


const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Link to refresh token
    refreshTokenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RefreshToken',
        required: true
    },

    // Device/Browser Information
    ip: {
        type: String,
        required: true
    },

    userAgent: {
        type: String,
        required: true
    },

    // Parsed device info
    device: {
        browser: String,
        browserVersion: String,
        os: String,
        osVersion: String,
        device: String,
        deviceType: String // 'mobile', 'tablet', 'desktop'
    },

    // Location (optional - can be added later with IP geolocation service)
    location: {
        city: String,
        country: String,
        countryCode: String
    },

    // Session Status
    isActive: {
        type: Boolean,
        default: true
    },

    // Activity Tracking
    lastActivity: {
        type: Date,
        default: Date.now
    },

    // Session Lifecycle
    createdAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date,
        required: true
    },

    endedAt: {
        type: Date
    },

    endReason: {
        type: String,
        enum: ['logout', 'expired', 'revoked', 'replaced'],
        required: false
    }
}, {
    timestamps: false
});

// Indexes
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ refreshTokenId: 1 });
sessionSchema.index({ expiresAt: 1 });

// TTL Index - Auto-delete expired sessions after 30 days
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Pre-save hook to parse user agent (Mongoose 7+ compatible)
sessionSchema.pre('save', function () {
    // Only parse if new session and device info not already set
    if (this.isNew && this.userAgent && (!this.device || !this.device.browser)) {
        const parser = new UAParser(this.userAgent);
        const result = parser.getResult();

        this.device = {
            browser: result.browser.name || 'Unknown',
            browserVersion: result.browser.version || '',
            os: result.os.name || 'Unknown',
            osVersion: result.os.version || '',
            device: result.device.model || result.device.type || 'Unknown',
            deviceType: result.device.type || 'desktop'
        };
    }
    // No next() needed in Mongoose 7+
});

// Instance method to end session
sessionSchema.methods.end = async function (reason = 'logout') {
    this.isActive = false;
    this.endedAt = new Date();
    this.endReason = reason;
    await this.save();
};

// Instance method to update activity
sessionSchema.methods.updateActivity = async function () {
    this.lastActivity = new Date();
    await this.save();
};

// Static method to create session
sessionSchema.statics.createSession = async function (userId, refreshTokenId, ip, userAgent) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Match refresh token expiry

    const session = await this.create({
        userId,
        refreshTokenId,
        ip,
        userAgent,
        expiresAt
    });

    return session;
};

// Static method to get active sessions for user
sessionSchema.statics.getActiveSessions = async function (userId) {
    return this.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
    })
        .sort({ lastActivity: -1 })
        .select('-userAgent'); // Don't expose full user agent string
};

// Static method to end all sessions for user
sessionSchema.statics.endAllForUser = async function (userId, reason = 'logout_all') {
    const result = await this.updateMany(
        { userId, isActive: true },
        {
            $set: {
                isActive: false,
                endedAt: new Date(),
                endReason: reason
            }
        }
    );

    return result.modifiedCount;
};

// Static method to cleanup inactive sessions
sessionSchema.statics.cleanupInactive = async function (days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.deleteMany({
        isActive: false,
        endedAt: { $lt: cutoff }
    });

    return result.deletedCount;
};

module.exports = mongoose.model('Session', sessionSchema);
