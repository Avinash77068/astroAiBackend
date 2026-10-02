const connectDB = require('../database/db');
const Notification = require('../model/notificationSchema');

const getRecipient = auth => {
    const roles = auth.roles || [auth.role];
    const isAstrologer = roles.includes('ASTROLOGER');
    return {
        recipientId: isAstrologer ? auth.astrologerId || auth.id : auth.id,
        recipientRole: isAstrologer ? 'ASTROLOGER' : 'USER'
    };
};

const listNotifications = async (req, res) => {
    try {
        await connectDB();
        const recipient = getRecipient(req.auth);
        const notifications = await Notification.find(recipient).sort({ createdAt: -1 }).limit(50).lean();
        const unreadCount = await Notification.countDocuments({ ...recipient, readAt: null });

        return res.json({ success: true, data: { notifications, unreadCount } });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to load notifications' });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        await connectDB();
        const recipient = getRecipient(req.auth);
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                ...recipient
            },
            { $set: { readAt: new Date() } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        return res.json({ success: true, data: notification });
    } catch (_error) {
        return res.status(500).json({ success: false, message: 'Unable to update notification' });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        await connectDB();
        const recipient = getRecipient(req.auth);
        await Notification.updateMany(
            {
                ...recipient,
                readAt: null
            },
            { $set: { readAt: new Date() } }
        );
        return res.json({ success: true, message: 'Notifications marked as read' });
    } catch (_error) {
        return res.status(500).json({ success: false, message: 'Unable to update notifications' });
    }
};

module.exports = { listNotifications, markNotificationRead, markAllNotificationsRead };