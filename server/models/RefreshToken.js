const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Hashed token (never store plain text)
    token: {
        type: String,
        required: true,
        unique: true
    },

    // Expiration
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },

    // Security tracking
    createdByIp: {
        type: String,
        required: true
    },

    userAgent: {
        type: String,
        required: false
    },

    // Token lifecycle
    isRevoked: {
        type: Boolean,
        default: false
    },

    revokedAt: {
        type: Date,
        required: false
    },

    revokedByIp: {
        type: String,
        required: false
    },

    revokedReason: {
        type: String,
        required: false
    },

    // Token rotation
    replacedByToken: {
        type: String,
        required: false
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

// TTL Index - Auto-delete expired tokens after 30 days
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Virtual for checking if token is expired
refreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expiresAt;
});

// Virtual for checking if token is active
refreshTokenSchema.virtual('isActive').get(function () {
    return !this.isRevoked && !this.isExpired;
});

// Instance method to revoke token
refreshTokenSchema.methods.revoke = async function (ip, reason = 'manual') {
    this.isRevoked = true;
    this.revokedAt = new Date();
    this.revokedByIp = ip;
    this.revokedReason = reason;
    await this.save();
};

// Static method to create refresh token
refreshTokenSchema.statics.createToken = async function (userId, ip, userAgent) {
    // Generate random token
    const token = crypto.randomBytes(40).toString('hex');

    // Hash the token before storing
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Set expiration (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create refresh token document
    const refreshToken = await this.create({
        userId,
        token: hashedToken,
        expiresAt,
        createdByIp: ip,
        userAgent
    });

    // Return plain token (only time it's available)
    return {
        id: refreshToken._id,
        token, // Plain text token
        expiresAt
    };
};

// Static method to verify and get token
refreshTokenSchema.statics.verifyToken = async function (token) {
    // Hash the incoming token
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find the token
    const refreshToken = await this.findOne({ token: hashedToken })
        .populate('userId', 'name email role');

    if (!refreshToken) {
        throw new Error('Invalid refresh token');
    }

    if (refreshToken.isRevoked) {
        throw new Error('Refresh token has been revoked');
    }

    if (refreshToken.isExpired) {
        throw new Error('Refresh token has expired');
    }

    return refreshToken;
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = async function (userId, ip, reason = 'logout_all') {
    const result = await this.updateMany(
        { userId, isRevoked: false },
        {
            $set: {
                isRevoked: true,
                revokedAt: new Date(),
                revokedByIp: ip,
                revokedReason: reason
            }
        }
    );

    return result.modifiedCount;
};

// Static method to clean up expired tokens
refreshTokenSchema.statics.cleanupExpired = async function () {
    const result = await this.deleteMany({
        expiresAt: { $lt: new Date() }
    });

    return result.deletedCount;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
