const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('../config/config');
const logger = require('./logger');

class SessionManager {
    constructor() {
        this.store = MongoStore.create({
            mongoUrl: config.database.uri,
            collectionName: 'sessions',
            ttl: 24 * 60 * 60, // 1 day
            autoRemove: 'native',
            touchAfter: 24 * 3600 // Update only once per 24 hours
        });

        // Setup store event handlers
        this.setupStoreEventHandlers();
    }

    /**
     * Setup session store event handlers
     */
    setupStoreEventHandlers() {
        this.store.on('create', (sessionId) => {
            logger.debug(`Session created: ${sessionId}`);
        });

        this.store.on('touch', (sessionId) => {
            logger.debug(`Session touched: ${sessionId}`);
        });

        this.store.on('destroy', (sessionId) => {
            logger.debug(`Session destroyed: ${sessionId}`);
        });

        this.store.on('error', (error) => {
            logger.error('Session store error:', error);
        });
    }

    /**
     * Get session middleware configuration
     * @returns {Object} Session middleware configuration
     */
    getConfig() {
        return session({
            store: this.store,
            secret: config.session.secret,
            name: 'sessionId',
            resave: false,
            saveUninitialized: false,
            rolling: true, // Reset expiration on every response
            cookie: {
                httpOnly: true,
                secure: config.isProduction(),
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }
        });
    }

    /**
     * Create a new session
     * @param {Object} req - Express request object
     * @param {Object} user - User object
     * @returns {Promise<void>}
     */
    async createSession(req, user) {
        return new Promise((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err) {
                    logger.error('Error regenerating session:', err);
                    return reject(err);
                }

                // Store user information
                req.session.user = {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                };

                // Store last activity timestamp
                req.session.lastActivity = Date.now();

                req.session.save((err) => {
                    if (err) {
                        logger.error('Error saving session:', err);
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    }

    /**
     * Destroy a session
     * @param {Object} req - Express request object
     * @returns {Promise<void>}
     */
    async destroySession(req) {
        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    logger.error('Error destroying session:', err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * Check if session is active
     * @param {Object} req - Express request object
     * @returns {boolean} True if session is active
     */
    isSessionActive(req) {
        return !!(req.session && req.session.user);
    }

    /**
     * Update last activity timestamp
     * @param {Object} req - Express request object
     */
    updateLastActivity(req) {
        if (req.session) {
            req.session.lastActivity = Date.now();
        }
    }

    /**
     * Get session age in milliseconds
     * @param {Object} req - Express request object
     * @returns {number} Session age in milliseconds
     */
    getSessionAge(req) {
        if (!req.session || !req.session.lastActivity) {
            return 0;
        }
        return Date.now() - req.session.lastActivity;
    }

    /**
     * Check if session has expired
     * @param {Object} req - Express request object
     * @returns {boolean} True if session has expired
     */
    hasSessionExpired(req) {
        const maxAge = config.session.cookie.maxAge;
        return this.getSessionAge(req) > maxAge;
    }

    /**
     * Middleware to check session expiration
     * @returns {Function} Express middleware
     */
    checkSessionExpiration() {
        return (req, res, next) => {
            if (this.isSessionActive(req) && this.hasSessionExpired(req)) {
                return this.destroySession(req)
                    .then(() => {
                        res.redirect('/login');
                    })
                    .catch(next);
            }
            this.updateLastActivity(req);
            next();
        };
    }

    /**
     * Get all active sessions
     * @returns {Promise<Array>} Array of active sessions
     */
    async getAllSessions() {
        return this.store.all();
    }

    /**
     * Clear all sessions
     * @returns {Promise<void>}
     */
    async clearAllSessions() {
        return this.store.clear();
    }

    /**
     * Get session by ID
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Session object
     */
    async getSession(sessionId) {
        return this.store.get(sessionId);
    }

    /**
     * Set session data
     * @param {string} sessionId - Session ID
     * @param {Object} session - Session data
     * @returns {Promise<void>}
     */
    async setSession(sessionId, session) {
        return this.store.set(sessionId, session);
    }

    /**
     * Delete session by ID
     * @param {string} sessionId - Session ID
     * @returns {Promise<void>}
     */
    async deleteSession(sessionId) {
        return this.store.destroy(sessionId);
    }
}

// Export singleton instance
module.exports = new SessionManager();
