const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema({
    identifier: { type: String, required: true, unique: true, index: true },
    otpHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    resendAt: { type: Date, required: true }
}, { timestamps: true });

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);