const Session = require('../models/Session');
const RefreshToken = require('../models/RefreshToken');
const { logAuthEvent } = require('../middleware/auditMiddleware');

/**
 * @desc    Get current user's active sessions
 * @route   GET /api/sessions/me
 * @access  Private
 */
const getMySessions = async (req, res) => {
    try {
        const sessions = await Session.getActiveSessions(req.user.id);

        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        console.error('[SESSION] Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions'
        });
    }
};

/**
 * @desc    Get specific session details
 * @route   GET /api/sessions/:id
 * @access  Private
 */
const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Ensure user can only view their own sessions
        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this session'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('[SESSION] Get session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching session'
        });
    }
};

/**
 * @desc    Revoke specific session (logout from specific device)
 * @route   DELETE /api/sessions/:id
 * @access  Private
 */
const revokeSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Ensure user can only revoke their own sessions
        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to revoke this session'
            });
        }

        // End the session
        await session.end('revoked_by_user');

        // Revoke the associated refresh token
        const refreshToken = await RefreshToken.findById(session.refreshTokenId);
        if (refreshToken) {
            await refreshToken.revoke(
                req.ip || req.connection.remoteAddress,
                'session_revoked'
            );
        }

        await logAuthEvent(
            'session_revoked',
            req.user,
            req,
            'success',
            { sessionId: session._id }
        );

        res.json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error) {
        console.error('[SESSION] Revoke session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error revoking session'
        });
    }
};

/**
 * @desc    Revoke all sessions except current (logout from all other devices)
 * @route   DELETE /api/sessions/all
 * @access  Private
 */
const revokeAllSessions = async (req, res) => {
    try {
        // Get current session (from refresh token cookie)
        const currentRefreshToken = req.cookies.refreshToken;
        let currentSessionId = null;

        if (currentRefreshToken) {
            try {
                const refreshToken = await RefreshToken.verifyToken(currentRefreshToken);
                const currentSession = await Session.findOne({
                    refreshTokenId: refreshToken._id
                });
                currentSessionId = currentSession?._id;
            } catch (err) {
                // If we can't verify current token, revoke all sessions
                console.log('[SESSION] Could not identify current session, revoking all');
            }
        }

        // Get all active sessions
        const sessions = await Session.find({
            userId: req.user.id,
            isActive: true
        });

        let revokedCount = 0;

        // End all sessions except current
        for (const session of sessions) {
            if (currentSessionId && session._id.toString() === currentSessionId.toString()) {
                continue; // Skip current session
            }

            await session.end('revoked_all_devices');

            // Revoke associated refresh token
            const refreshToken = await RefreshToken.findById(session.refreshTokenId);
            if (refreshToken) {
                await refreshToken.revoke(
                    req.ip || req.connection.remoteAddress,
                    'logout_all_devices'
                );
            }

            revokedCount++;
        }

        await logAuthEvent(
            'logout_all_devices',
            req.user,
            req,
            'success',
            { sessionsRevoked: revokedCount }
        );

        res.json({
            success: true,
            message: `Logged out from ${revokedCount} other device(s)`,
            sessionsRevoked: revokedCount
        });
    } catch (error) {
        console.error('[SESSION] Revoke all sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error revoking sessions'
        });
    }
};

/**
 * @desc    Get session statistics (Admin only)
 * @route   GET /api/sessions/stats
 * @access  Private (Admin)
 */
const getSessionStats = async (req, res) => {
    try {
        const totalActive = await Session.countDocuments({ isActive: true });
        const totalAll = await Session.countDocuments();

        const recentSessions = await Session.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email');

        res.json({
            success: true,
            data: {
                totalActiveSessions: totalActive,
                totalSessions: totalAll,
                recentSessions
            }
        });
    } catch (error) {
        console.error('[SESSION] Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching session statistics'
        });
    }
};

/**
 * @desc    Clean up inactive/expired sessions (Maintenance endpoint)
 * @route   POST /api/sessions/cleanup
 * @access  Private (Admin)
 */
const cleanupSessions = async (req, res) => {
    try {
        const days = req.body.days || 30;

        const deletedCount = await Session.cleanupInactive(days);
        const expiredTokens = await RefreshToken.cleanupExpired();

        res.json({
            success: true,
            message: 'Cleanup completed',
            data: {
                sessionsDeleted: deletedCount,
                tokensDeleted: expiredTokens
            }
        });
    } catch (error) {
        console.error('[SESSION] Cleanup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during cleanup'
        });
    }
};

module.exports = {
    getMySessions,
    getSession,
    revokeSession,
    revokeAllSessions,
    getSessionStats,
    cleanupSessions
};
