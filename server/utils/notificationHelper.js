const Notification = require('../models/Notification');

/**
 * Create and emit a notification
 * @param {Object} io - Socket.io instance
 * @param {String} recipientId - User ID to receive the notification
 * @param {Object} data - Notification data { title, message, type, link, metadata }
 * @returns {Object} The created notification document
 */
const createNotification = async (io, recipientId, { title, message, type = 'info', link = null, metadata = {} }) => {
    try {
        // Save to database
        const notification = await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            link,
            metadata
        });

        // Prepare notification for socket emission
        const notificationData = {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            link: notification.link,
            isRead: notification.isRead,
            timestamp: notification.createdAt,
            metadata: notification.metadata
        };

        // Emit to the user's private room
        if (io) {
            io.to(recipientId.toString()).emit('receive_notification', notificationData);
        }

        return notification;
    } catch (error) {
        console.error('[NotificationHelper] Error creating notification:', error);
        throw error;
    }
};

/**
 * Create notifications for multiple recipients
 * @param {Object} io - Socket.io instance
 * @param {Array} recipientIds - Array of user IDs
 * @param {Object} data - Notification data
 */
const createBulkNotifications = async (io, recipientIds, data) => {
    const promises = recipientIds.map(recipientId =>
        createNotification(io, recipientId, data)
    );
    return Promise.all(promises);
};

/**
 * Notify all admins of a consultancy
 * @param {Object} io - Socket.io instance
 * @param {String} consultancyId - Consultancy ID
 * @param {Object} data - Notification data
 */
const notifyConsultancyAdmins = async (io, consultancyId, data) => {
    const User = require('../models/User');

    try {
        const admins = await User.find({
            consultancy: consultancyId,
            role: { $in: ['consultancy_admin', 'consultancy_staff'] }
        }).select('_id');

        const adminIds = admins.map(admin => admin._id);
        return createBulkNotifications(io, adminIds, data);
    } catch (error) {
        console.error('[NotificationHelper] Error notifying consultancy admins:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    createBulkNotifications,
    notifyConsultancyAdmins
};
