const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        balanceMinor: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: "INR", required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);