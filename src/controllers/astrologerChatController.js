const mongoose = require("mongoose");
const connectDB = require("../database/db.js");
const User = require("../model/userSchema");
const Notification = require("../model/notificationSchema");

const getAstrologerObjectId = req => {
    const id = req.auth.astrologerId || req.auth.id;
    return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
};

// Customers who have chatted with the signed-in astrologer, newest conversation first.
const listConversations = async (req, res) => {
    try {
        await connectDB();
        const astrologerId = getAstrologerObjectId(req);
        if (!astrologerId) {
            return res.status(400).json({ success: false, message: "Astrologer account required" });
        }

        const conversations = await User.aggregate([
            { $match: { "chat.astrologerId": astrologerId } },
            {
                $project: {
                    name: 1,
                    photo: 1,
                    messages: { $filter: { input: "$chat", as: "m", cond: { $eq: ["$$m.astrologerId", astrologerId] } } }
                }
            },
            {
                $project: {
                    name: 1,
                    photo: 1,
                    messageCount: { $size: "$messages" },
                    last: { $arrayElemAt: ["$messages", -1] }
                }
            },
            {
                $addFields: {
                    answered: { $gt: [{ $strLenCP: { $ifNull: ["$last.astroResponse", ""] } }, 0] }
                }
            },
            {
                $project: {
                    name: 1,
                    photo: 1,
                    messageCount: 1,
                    // An AI reply counts as answered, so the conversation no longer needs the astrologer's reply.
                    lastMessage: { $cond: ["$answered", "$last.astroResponse", "$last.message"] },
                    lastSender: { $cond: ["$answered", "astrologer", "$last.sender"] },
                    lastAt: "$last.timestamp"
                }
            },
            { $sort: { lastAt: -1 } },
            { $limit: 100 }
        ]);

        return res.json({ success: true, data: { conversations } });
    } catch (_error) {
        return res.status(500).json({ success: false, message: "Unable to load conversations" });
    }
};

const getConversation = async (req, res) => {
    try {
        await connectDB();
        const astrologerId = getAstrologerObjectId(req);
        const { customerId } = req.params;
        if (!astrologerId || !mongoose.isValidObjectId(customerId)) {
            return res.status(400).json({ success: false, message: "Valid customer is required" });
        }

        const customer = await User.findById(customerId).select("name photo chat");
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const messages = customer.chat
            .filter(entry => entry.astrologerId?.toString() === astrologerId.toString())
            .flatMap(entry => {
                const items = [];
                if (entry.sender !== "astrologer" && entry.message) {
                    items.push({ id: `${entry._id}_user`, sender: "customer", text: entry.message, timestamp: entry.timestamp });
                }
                if (entry.astroResponse) {
                    items.push({ id: `${entry._id}_astro`, sender: "astrologer", text: entry.astroResponse, timestamp: entry.timestamp });
                }
                return items;
            });

        return res.json({
            success: true,
            data: { customer: { id: customer._id, name: customer.name, photo: customer.photo }, messages }
        });
    } catch (_error) {
        return res.status(500).json({ success: false, message: "Unable to load conversation" });
    }
};

const replyToCustomer = async (req, res) => {
    try {
        await connectDB();
        const astrologerId = getAstrologerObjectId(req);
        const { customerId } = req.params;
        const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
        if (!astrologerId || !mongoose.isValidObjectId(customerId)) {
            return res.status(400).json({ success: false, message: "Valid customer is required" });
        }
        if (!message) {
            return res.status(400).json({ success: false, message: "message is required" });
        }
        if (message.length > 3000) {
            return res.status(400).json({ success: false, message: "message must be 3000 characters or fewer" });
        }

        const customer = await User.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        const hasConversation = customer.chat.some(entry => entry.astrologerId?.toString() === astrologerId.toString());
        if (!hasConversation) {
            return res.status(403).json({ success: false, message: "This customer has not messaged you" });
        }

        customer.chat.push({ astrologerId, sender: "astrologer", astroResponse: message, timestamp: new Date() });
        await customer.save();

        Notification.create({
            recipientId: customer._id,
            recipientRole: "USER",
            type: "CHAT_MESSAGE",
            title: "New reply from your astrologer",
            body: message.slice(0, 120),
            data: { astrologerId: astrologerId.toString() }
        }).catch(error => console.error("Customer notification failed:", error.message));

        const saved = customer.chat[customer.chat.length - 1];
        return res.status(201).json({
            success: true,
            data: { id: `${saved._id}_astro`, sender: "astrologer", text: message, timestamp: saved.timestamp },
            message: "Reply sent"
        });
    } catch (_error) {
        return res.status(500).json({ success: false, message: "Unable to send reply" });
    }
};

const getConversationAiSettings = async (req, res) => {
    try {
        await connectDB();
        const astrologerId = getAstrologerObjectId(req);
        const { customerId } = req.params;
        if (!astrologerId || !mongoose.isValidObjectId(customerId)) {
            return res.status(400).json({ success: false, message: "Valid customer is required" });
        }

        const customer = await User.findOne({
            _id: customerId,
            "chat.astrologerId": astrologerId
        }).select("aiReplyEnabledAstrologerIds").lean();
        if (!customer) {
            return res.status(403).json({ success: false, message: "This customer has not messaged you" });
        }

        const enabled = (customer.aiReplyEnabledAstrologerIds || []).some(
            id => id.toString() === astrologerId.toString()
        );
        return res.json({
            success: true,
            data: { aiAvailable: true, enabled },
            message: "Chat AI settings fetched successfully"
        });
    } catch (_error) {
        return res.status(500).json({ success: false, message: "Unable to fetch chat AI settings" });
    }
};

const updateConversationAiSettings = async (req, res) => {
    try {
        await connectDB();
        const astrologerId = getAstrologerObjectId(req);
        const { customerId } = req.params;
        const { enabled } = req.body;
        if (!astrologerId || !mongoose.isValidObjectId(customerId) || typeof enabled !== "boolean") {
            return res.status(400).json({ success: false, message: "Valid customer and enabled setting are required" });
        }

        const update = enabled
            ? { $addToSet: { aiReplyEnabledAstrologerIds: astrologerId } }
            : { $pull: { aiReplyEnabledAstrologerIds: astrologerId } };
        const result = await User.updateOne({
            _id: customerId,
            "chat.astrologerId": astrologerId
        }, update);
        if (!result.matchedCount) {
            return res.status(403).json({ success: false, message: "This customer has not messaged you" });
        }

        return res.json({
            success: true,
            data: { aiAvailable: true, enabled },
            message: "Chat AI settings updated successfully"
        });
    } catch (_error) {
        return res.status(500).json({ success: false, message: "Unable to update chat AI settings" });
    }
};

module.exports = {
    listConversations,
    getConversation,
    replyToCustomer,
    getConversationAiSettings,
    updateConversationAiSettings
};
