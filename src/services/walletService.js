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

const CHAT_MESSAGE_CHARGE_MINOR = 10;

// Moves the per-message fee from the customer's wallet to the astrologer's. Returns false if the customer can't afford it.
const chargeChatMessage = async ({ customerId, astrologerAccountId, amountMinor = CHAT_MESSAGE_CHARGE_MINOR }) => {
    const customerWallet = await Wallet.findOneAndUpdate(
        { userId: customerId, balanceMinor: { $gte: amountMinor } },
        { $inc: { balanceMinor: -amountMinor } },
        { new: true }
    );
    if (!customerWallet) return false;

    try {
        const astrologerWallet = await Wallet.findOneAndUpdate(
            { userId: astrologerAccountId },
            { $inc: { balanceMinor: amountMinor }, $setOnInsert: { userId: astrologerAccountId, currency: "INR" } },
            { new: true, upsert: true }
        );
        const metadata = { reason: 'CHAT_MESSAGE', customerId: String(customerId), astrologerId: String(astrologerAccountId) };
        await WalletTransaction.insertMany([
            { userId: customerId, walletId: customerWallet._id, type: 'DEBIT', status: 'SUCCESS', amountMinor, description: 'Chat message charge', metadata },
            { userId: astrologerAccountId, walletId: astrologerWallet._id, type: 'CREDIT', status: 'SUCCESS', amountMinor, description: 'Chat message earning', metadata }
        ]);
        return true;
    } catch (error) {
        await Wallet.updateOne({ _id: customerWallet._id }, { $inc: { balanceMinor: amountMinor } });
        throw error;
    }
};

module.exports = { ensureWallet, ensureAstrologerWelcomeBalance, chargeChatMessage, CHAT_MESSAGE_CHARGE_MINOR };
