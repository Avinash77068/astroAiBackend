const Wallet = require("../model/walletSchema");
const WalletTransaction = require("../model/walletTransactionSchema");

const ASTROLOGER_WELCOME_BALANCE_MINOR = 1200;

const ensureWallet = async userId => Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, balanceMinor: 0, currency: "INR" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
);

const ensureAstrologerWelcomeBalance = async userId => {
    const wallet = await ensureWallet(userId);
    const welcomeCreditMinor = Math.max(0, ASTROLOGER_WELCOME_BALANCE_MINOR - wallet.balanceMinor);
    if (!welcomeCreditMinor) return wallet;

    const fundedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id, balanceMinor: { $lt: ASTROLOGER_WELCOME_BALANCE_MINOR } },
        { $set: { balanceMinor: ASTROLOGER_WELCOME_BALANCE_MINOR } },
        { new: true }
    );
    if (!fundedWallet) return Wallet.findOne({ userId });

    try {
        await WalletTransaction.create({
            userId,
            walletId: fundedWallet._id,
            type: 'CREDIT',
            status: 'SUCCESS',
            amountMinor: welcomeCreditMinor,
            currency: 'INR',
            description: 'Astrologer welcome balance',
            referenceId: `astrologer-welcome-${userId}`,
            metadata: { reason: 'ASTROLOGER_APPROVAL_WELCOME_BALANCE' }
        });
    } catch (error) {
        await Wallet.updateOne(
            { _id: fundedWallet._id, balanceMinor: ASTROLOGER_WELCOME_BALANCE_MINOR },
            { $set: { balanceMinor: wallet.balanceMinor } }
        );
        throw error;
    }

    return fundedWallet;
};

module.exports = { ensureWallet, ensureAstrologerWelcomeBalance };
