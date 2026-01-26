const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logsDir = path.join(__dirname, '../../logs');
        this.ensureLogsDirectory();
    }

    ensureLogsDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    getLogFileName(type) {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logsDir, `${type}-${date}.log`);
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = this.getTimestamp();
        const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
    }

    writeToFile(filename, content) {
        try {
            fs.appendFileSync(filename, content);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    info(message, meta = {}) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const formatted = this.formatMessage('INFO', message, meta);
            console.log(`\x1b[36m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('info'), formatted);
        }
    }

    error(message, meta = {}) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const formatted = this.formatMessage('ERROR', message, meta);
            console.error(`\x1b[31m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('error'), formatted);
        }
    }

    warn(message, meta = {}) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const formatted = this.formatMessage('WARN', message, meta);
            console.warn(`\x1b[33m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('warn'), formatted);
        }
    }

    success(message, meta = {}) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const formatted = this.formatMessage('SUCCESS', message, meta);
            console.log(`\x1b[32m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('info'), formatted);
        }
    }

    debug(message, meta = {}) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const formatted = this.formatMessage('DEBUG', message, meta);
            console.log(`\x1b[35m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('debug'), formatted);
        }
    }

    http(req, res, responseTime) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`;
            const meta = {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                responseTime: `${responseTime}ms`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            };
            
            const formatted = this.formatMessage('HTTP', message, meta);
            console.log(`\x1b[34m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('http'), formatted);
        }
    }

    api(endpoint, method, status, data = {}) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const message = `API ${method} ${endpoint} - Status: ${status}`;
            const formatted = this.formatMessage('API', message, data);
            console.log(`\x1b[36m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('api'), formatted);
        }
    }

    database(operation, collection, data = {}) {
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            const message = `DB ${operation} on ${collection}`;
            const formatted = this.formatMessage('DATABASE', message, data);
            console.log(`\x1b[35m${formatted}\x1b[0m`);
            this.writeToFile(this.getLogFileName('database'), formatted);
        }
    }
}

module.exports = new Logger();
