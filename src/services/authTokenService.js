const jwt = require('jsonwebtoken');

const signAuthToken = (id, role = 'USER', astrologerId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required to issue an authentication token');
    }

    const normalizedRole = String(role).toUpperCase();
    if (!['USER', 'ASTROLOGER'].includes(normalizedRole)) {
        throw new Error('Cannot issue an authentication token for an unsupported role');
    }

    return jwt.sign(
        {
            role: normalizedRole,
            ...(astrologerId ? { astrologerId: String(astrologerId) } : {})
        },
        process.env.JWT_SECRET,
        {
            subject: String(id),
            expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );
};

module.exports = { signAuthToken };