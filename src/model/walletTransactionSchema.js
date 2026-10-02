const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
        type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
        status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"], default: "PENDING" },
        amountMinor: { type: Number, required: true, min: 1 },
        currency: { type: String, default: "INR", required: true },
        description: { type: String, required: true },
        referenceId: { type: String, default: "" },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);