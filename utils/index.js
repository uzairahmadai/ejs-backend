/**
 * Centralized exports for all utility modules
 */

const cache = require('./cache');
const database = require('./database');
const errors = require('./errors');
const helpers = require('./helpers');
const logger = require('./logger');
const mailer = require('./mailer');
const response = require('./response');
const security = require('./security');
const session = require('./session');
const upload = require('./upload');
const validator = require('./validator');

// Export all utilities
module.exports = {
    // Core utilities
    cache,
    database,
    errors,
    helpers,
    logger,
    mailer,
    response,
    security,
    session,
    upload,
    validator,

    // Destructure specific exports for convenience
    ...errors, // Export individual error classes

    // Helper functions
    isProduction: () => process.env.NODE_ENV === 'production',
    isDevelopment: () => process.env.NODE_ENV === 'development',
    isTest: () => process.env.NODE_ENV === 'test',

    // Convenience methods
    async init() {
        try {
            // Initialize database connection
            await database.connect();
            logger.info('Database connected successfully');

            // Verify email configuration
            const emailConfigValid = await mailer.verifyConnection();
            if (emailConfigValid) {
                logger.info('Email configuration verified successfully');
            } else {
                logger.warn('Email configuration verification failed');
            }

            // Initialize upload directories
            await upload.initializeDirectories();
            logger.info('Upload directories initialized');

            // Clear temporary files
            await upload.cleanTemp();
            logger.info('Temporary files cleaned');

            return true;
        } catch (error) {
            logger.error('Initialization error:', error);
            throw error;
        }
    },

    async cleanup() {
        try {
            // Close database connection
            await database.closeConnection();
            logger.info('Database connection closed');

            // Clear cache
            cache.clear();
            logger.info('Cache cleared');

            // Clean temporary files
            await upload.cleanTemp();
            logger.info('Temporary files cleaned');

            return true;
        } catch (error) {
            logger.error('Cleanup error:', error);
            throw error;
        }
    }
};

// Add process handlers for cleanup
process.on('SIGINT', async () => {
    try {
        await module.exports.cleanup();
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
