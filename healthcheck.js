const http = require('http');
const logger = require('./utils/logger');

const options = {
    host: 'localhost',
    port: process.env.PORT || 3000,
    path: '/health',
    timeout: 2000
};

const request = http.request(options, (res) => {
    logger.info(`Health check status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        logger.error(`Health check failed with status: ${res.statusCode}`);
        process.exit(1);
    }
});

request.on('error', (err) => {
    logger.error('Health check failed:', err);
    process.exit(1);
});

// Set timeout for the request
request.setTimeout(options.timeout, () => {
    logger.error('Health check timeout');
    request.destroy();
    process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception in health check:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection in health check:', reason);
    process.exit(1);
});

// Send the request
request.end();
