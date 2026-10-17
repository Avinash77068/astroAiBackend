const connectDB = require("../src/database/db.js");
const User = require("../src/model/userSchema");
const Astrologer = require("../src/model/astrologerSchema");
const Wallet = require("../src/model/walletSchema");
const WalletTransaction = require("../src/model/walletTransactionSchema");

const BONUS_MINOR = 500;

// One-time ₹5 credit for every user and astrologer account. Same referenceId as grantUserBalance.js, so re-runs (and users already credited by it) are skipped.
connectDB()
    .then(async mongoose => {
        const [users, astrologers] = await Promise.all([
            User.find({}).select("_id").lean(),
            Astrologer.find({ accountId: { $exists: true, $ne: null } }).select("accountId").lean()
        ]);
        const accountIds = new Map();
        users.forEach(({ _id }) => accountIds.set(String(_id), _id));
        astrologers.forEach(({ accountId }) => accountIds.set(String(accountId), accountId));

        let credited = 0;
        for (const id of accountIds.values()) {
            const referenceId = `bonus-5rs-${id}`;
            if (await WalletTransaction.exists({ userId: id, referenceId })) continue;

            const wallet = await Wallet.findOneAndUpdate(
                { userId: id },
                { $inc: { balanceMinor: BONUS_MINOR }, $setOnInsert: { userId: id, currency: "INR" } },
                { new: true, upsert: true }
            );
            await WalletTransaction.create({
                userId: id,
                walletId: wallet._id,
                type: "CREDIT",
                status: "SUCCESS",
                amountMinor: BONUS_MINOR,
                description: "Bonus credit",
                referenceId,
                metadata: { reason: "BONUS_5_RUPEES" }
            });
            credited++;
        }

        console.log(`Credited ₹5 to ${credited} of ${accountIds.size} accounts (${users.length} users, ${astrologers.length} astrologers)`);
        await mongoose.disconnect();
    })
    .catch(error => {
        console.error("Grant failed:", error.message);
        process.exit(1);
    });
