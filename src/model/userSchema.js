const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    message: { type: String },
    sender: { type: String },
    astroResponse: { type: String },
    timestamp: { type: Date, default: Date.now }
})

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, unique: true, sparse: true },
    name: { type: String, default: "" },
    place: { type: String },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },
    email: { type: String },
    password: { type: String },
    photo: { type: String },
    isGoogleLogin: { type: Boolean, default: false },
    token: { type: String },

    chat: [chatSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);