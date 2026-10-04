const connectDB = require("../src/database/db.js");
const User = require("../src/model/userSchema");
const Wallet = require("../src/model/walletSchema");
const WalletTransaction = require("../src/model/walletTransactionSchema");

const BONUS_MINOR = 500;

// One-time ₹5 credit for every customer. referenceId makes re-runs skip users already credited.
connectDB()
    .then(async mongoose => {
        const users = await User.find({}).select("_id").lean();
        let credited = 0;

        for (const { _id } of users) {
            const referenceId = `bonus-5rs-${_id}`;
            if (await WalletTransaction.exists({ userId: _id, referenceId })) continue;

            const wallet = await Wallet.findOneAndUpdate(
                { userId: _id },
                { $inc: { balanceMinor: BONUS_MINOR }, $setOnInsert: { userId: _id, currency: "INR" } },
                { new: true, upsert: true }
            );
            await WalletTransaction.create({
                userId: _id,
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

        console.log(`Credited ₹5 to ${credited} of ${users.length} users`);
        await mongoose.disconnect();
    })
    .catch(error => {
        console.error("Grant failed:", error.message);
        process.exit(1);
    });
