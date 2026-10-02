const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    recipientRole: { type: String, enum: ['USER', 'ASTROLOGER'], required: true },
    type: { type: String, enum: ['CHAT_MESSAGE', 'BOOKING', 'APPLICATION'], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, recipientRole: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);