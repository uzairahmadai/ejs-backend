const winston = require('winston');
const path = require('path');
const config = require('../config/config');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define level colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

// Set winston colors
winston.addColors(colors);

// Create format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Create format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

// Define log directory
const logDir = path.join(__dirname, '../logs');

// Create logger instance
const logger = winston.createLogger({
    level: config.isDevelopment() ? 'debug' : 'info',
    levels,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: consoleFormat
        }),

        // Error log file transport
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        // Combined log file transport
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    // Handle unhandled rejections
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Create a stream object for Morgan middleware
logger.stream = {
    write: (message) => logger.http(message.trim())
};

// Add request context middleware
logger.middleware = (req, res, next) => {
    // Add request ID to context
    const requestId = req.id || Math.random().toString(36).substring(7);
    
    // Create child logger with request context
    req.logger = logger.child({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip
    });

    next();
};

// Helper methods for structured logging
logger.logError = (error, context = {}) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        ...context
    });
};

logger.logAPIRequest = (req, context = {}) => {
    logger.http({
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
        ip: req.ip,
        ...context
    });
};

logger.logDatabaseQuery = (operation, collection, query, duration, context = {}) => {
    logger.debug({
        type: 'database',
        operation,
        collection,
        query,
        duration,
        ...context
    });
};

logger.logPerformance = (label, duration, context = {}) => {
    logger.info({
        type: 'performance',
        label,
        duration,
        ...context
    });
};

logger.logAudit = (userId, action, details, context = {}) => {
    logger.info({
        type: 'audit',
        userId,
        action,
        details,
        timestamp: new Date(),
        ...context
    });
};

logger.logSecurity = (event, details, context = {}) => {
    logger.warn({
        type: 'security',
        event,
        details,
        timestamp: new Date(),
        ...context
    });
};

// Development helper for debugging
if (config.isDevelopment()) {
    logger.debug('Logger initialized in development mode');
}

// Export logger instance
module.exports = logger;
