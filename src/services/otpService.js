const crypto = require('crypto');

const getOtpIdentifier = ({ phoneNumber, email }) => {
    if (phoneNumber) return `phone:${String(phoneNumber).replace(/\s+/g, '')}`;
    if (email) return `email:${String(email).trim().toLowerCase()}`;
    return null;
};

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const hashOtp = otp => {
    const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('OTP_SECRET or JWT_SECRET must be configured');
    return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
};

const otpMatches = (otp, expectedHash) => {
    const actual = Buffer.from(hashOtp(otp), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

module.exports = { getOtpIdentifier, generateOtp, hashOtp, otpMatches };