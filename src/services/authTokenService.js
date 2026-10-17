const jwt = require('jsonwebtoken');
const env = require("../config/env");

const VALID_ROLES = ['USER', 'ASTROLOGER', 'ADMIN'];

const normalizeRoles = roles => {
    const normalized = (Array.isArray(roles) ? roles : [roles])
        .filter(role => typeof role === 'string')
        .map(role => role.toUpperCase())
        .filter(role => VALID_ROLES.includes(role));
    return [...new Set(normalized.length ? normalized : ['USER'])];
};

const signAuthToken = (id, roles = ['USER'], astrologerId) => {
    if (!env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required to issue an authentication token');
    }

    const normalizedRoles = normalizeRoles(roles);

    return jwt.sign(
        {
            roles: normalizedRoles,
            ...(astrologerId ? { astrologerId: String(astrologerId) } : {})
        },
        env.JWT_SECRET,
        {
            subject: String(id),
            expiresIn: env.JWT_EXPIRE
        }
    );
};

module.exports = { signAuthToken, normalizeRoles };