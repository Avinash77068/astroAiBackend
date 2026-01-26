const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log incoming request
    logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.method !== 'GET' ? req.body : undefined
    });

    // Capture the original res.json to log response
    const originalJson = res.json;
    res.json = function (data) {
        const responseTime = Date.now() - startTime;
        
        // Log HTTP request details
        logger.http(req, res, responseTime);

        // Log API response
        logger.api(req.originalUrl, req.method, res.statusCode, {
            responseTime: `${responseTime}ms`,
            success: data?.success
        });

        return originalJson.call(this, data);
    };

    next();
};

module.exports = requestLogger;
