const Wallet = require("../model/walletSchema");

const ensureWallet = async userId => Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, balanceMinor: 0, currency: "INR" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
);

module.exports = { ensureWallet };