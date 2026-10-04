const connectDB = require("../database/db.js");
const User = require("../model/userSchema.js");
const Astrologer = require("../model/astrologerSchema.js");
const Wallet = require("../model/walletSchema.js");
const WalletTransaction = require("../model/walletTransactionSchema.js");
const { ensureAstrologerWelcomeBalance } = require("../services/walletService.js");

const getWalletByUserId = async (req, res) => {
    try {
        await connectDB();
        const { userId } = req.params;
        if (!req.auth?.id || String(req.auth.id) !== String(userId)) {
            return res.status(403).json({ success: false, message: "You can only view your own wallet" });
        }
        const accountExists = await User.exists({ _id: userId })
            || await Astrologer.exists({ $or: [{ accountId: userId }, { _id: userId }] });
        if (!accountExists) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const wallet = req.auth.roles?.includes('ASTROLOGER')
            ? await ensureAstrologerWelcomeBalance(userId)
            : await Wallet.findOne({ userId }).lean();
        if (!wallet) {
            return res.status(404).json({ success: false, message: "Wallet not initialized" });
        }

        const transactions = await WalletTransaction.find({ walletId: wallet._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return res.json({
            success: true,
            data: {
                wallet: {
                    balanceMinor: wallet.balanceMinor,
                    currency: wallet.currency
                },
                transactions
            },
            message: "Wallet fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch wallet",
            error: error.message
        });
    }
};

module.exports = { getWalletByUserId };
