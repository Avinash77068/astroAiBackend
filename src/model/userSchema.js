const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, unique: true, sparse: true },
    name: { type: String, default: "" },
    place: { type: String },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },
    email: { type: String },
    password: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);