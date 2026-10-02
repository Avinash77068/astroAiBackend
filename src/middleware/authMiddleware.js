const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ success: false, message: 'Authentication is not configured' });
    }

    try {
        const claims = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
        const role = typeof claims.role === 'string' ? claims.role.toUpperCase() : '';
        if (!claims.sub || !['USER', 'ASTROLOGER', 'ADMIN'].includes(role)) {
            return res.status(401).json({ success: false, message: 'Invalid authentication token' });
        }

        req.auth = {
            id: String(claims.sub),
            role,
            astrologerId: claims.astrologerId ? String(claims.astrologerId) : undefined
        };
        return next();
    } catch (_error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
        return res.status(403).json({ success: false, message: 'You do not have access to this resource' });
    }
    return next();
};

module.exports = { authenticate, requireRole };