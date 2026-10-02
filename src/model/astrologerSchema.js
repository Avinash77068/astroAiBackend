const mongoose = require("mongoose");

const astrologerSchema = new mongoose.Schema(
    {
        astrologerId: {
            type: Number,
            unique: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },

        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            sparse: true,
            index: true
        },

        roles: {
            type: [{ type: String, enum: ["USER", "ASTROLOGER", "ADMIN"] }],
            default: ["ASTROLOGER"]
        },

        email: { type: String, trim: true, lowercase: true, select: false },
        phoneNumber: { type: String, trim: true, select: false },
        place: { type: String, default: "" },
        dateOfBirth: { type: String, default: "" },
        gender: { type: String, default: "" },
        photo: { type: String, default: "" },
        astrologerApplicationStatus: {
            type: String,
            enum: ["APPROVED"],
            default: "APPROVED"
        },

        notificationEmail: {
            type: String,
            trim: true,
            lowercase: true,
            select: false
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            required: true,
            index: true
            // eg: Vedic astrology, Tarot
        },

        description: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
            index: true
        },

        reviews: {
            type: Number,
            default: 0
        },

        price: {
            type: String,
            required: true
            // FREE / ₹30/min
        },

        verified: {
            type: Boolean,
            default: false
        },

        image: {
            type: String,
            default: ""
        },

        profileUrl: {
            type: String,
            default: ""
        },

        experience: {
            type: String
            // "5 years"
        },

        languages: {
            type: [String],
            default: []
        },

        specialization: {
            type: [String],
            default: []
        },

        sessionType: {
            type: String,
            enum: ["CALL", "CHAT", "VIDEO"],
            default: "CHAT"
        },

        status: {
            type: String,
            enum: ["ONLINE", "OFFLINE", "BUSY"],
            default: "OFFLINE",
            index: true
        },

        startTime: {
            type: Date
        },

        // 🔐 Session / Auth related
        jwtToken: {
            type: String,
            select: false // response me expose nahi hoga
        },

        sessionId: {
            type: String,
            index: true
        },
        chat: [{
            astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer" },
            message: { type: String },
            sender: { type: String },
            astroResponse: { type: String },
            timestamp: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Astrologer", astrologerSchema);
