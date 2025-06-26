const NodeCache = require('node-cache');
const config = require('../config/config');
const logger = require('./logger');

class Cache {
    constructor() {
        // Initialize cache with standard TTL from config
        this.cache = new NodeCache({
            stdTTL: config.cache.duration,
            checkperiod: config.cache.duration * 0.2, // Check for expired keys at 20% of TTL
            useClones: false // Store/retrieve references instead of copies
        });

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup cache event listeners
     */
    setupEventListeners() {
        this.cache.on('set', (key, value) => {
            logger.debug(`Cache set: ${key}`);
        });

        this.cache.on('del', (key, value) => {
            logger.debug(`Cache delete: ${key}`);
        });

        this.cache.on('expired', (key, value) => {
            logger.debug(`Cache expired: ${key}`);
        });

        this.cache.on('flush', () => {
            logger.debug('Cache flushed');
        });
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or undefined
     */
    get(key) {
        return this.cache.get(key);
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in seconds (optional)
     * @returns {boolean} True if successful
     */
    set(key, value, ttl = config.cache.duration) {
        return this.cache.set(key, value, ttl);
    }

    /**
     * Delete value from cache
     * @param {string} key - Cache key
     * @returns {number} Number of deleted entries
     */
    delete(key) {
        return this.cache.del(key);
    }

    /**
     * Clear all cache entries
     * @returns {void}
     */
    clear() {
        return this.cache.flushAll();
    }

    /**
     * Get multiple values from cache
     * @param {string[]} keys - Array of cache keys
     * @returns {Object} Object with key-value pairs
     */
    getMultiple(keys) {
        return this.cache.mget(keys);
    }

    /**
     * Set multiple values in cache
     * @param {Object} data - Object with key-value pairs
     * @param {number} ttl - Time to live in seconds (optional)
     * @returns {boolean} True if successful
     */
    setMultiple(data, ttl = config.cache.duration) {
        return this.cache.mset(
            Object.entries(data).map(([key, value]) => ({
                key,
                val: value,
                ttl
            }))
        );
    }

    /**
     * Delete multiple values from cache
     * @param {string[]} keys - Array of cache keys
     * @returns {number} Number of deleted entries
     */
    deleteMultiple(keys) {
        return this.cache.del(keys);
    }

    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean} True if exists
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Get all cache keys
     * @returns {string[]} Array of cache keys
     */
    keys() {
        return this.cache.keys();
    }

    /**
     * Get or set cache value with callback
     * @param {string} key - Cache key
     * @param {Function} callback - Callback to get value if not in cache
     * @param {number} ttl - Time to live in seconds (optional)
     * @returns {Promise<*>} Cached or computed value
     */
    async getOrSet(key, callback, ttl = config.cache.duration) {
        const value = this.get(key);
        if (value !== undefined) {
            return value;
        }

        try {
            const newValue = await callback();
            this.set(key, newValue, ttl);
            return newValue;
        } catch (error) {
            logger.error(`Cache getOrSet error for key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Cache middleware for Express routes
     * @param {number} duration - Cache duration in seconds (optional)
     * @returns {Function} Express middleware
     */
    middleware(duration = config.cache.duration) {
        return (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            const key = `__express__${req.originalUrl || req.url}`;
            const cachedBody = this.get(key);

            if (cachedBody) {
                // Return cached response
                res.send(cachedBody);
                return;
            }

            // Store original send
            const originalSend = res.send;

            // Override send
            res.send = function(body) {
                // Cache response
                cache.set(key, body, duration);
                
                // Call original send
                originalSend.call(this, body);
            };

            next();
        };
    }

    /**
     * Clear cache by pattern
     * @param {string} pattern - Pattern to match keys
     * @returns {number} Number of deleted entries
     */
    clearPattern(pattern) {
        const regex = new RegExp(pattern);
        const keys = this.cache.keys().filter(key => regex.test(key));
        return this.cache.del(keys);
    }

    /**
     * Set default TTL
     * @param {number} ttl - Time to live in seconds
     */
    setDefaultTTL(ttl) {
        this.cache.options.stdTTL = ttl;
    }
}

// Export singleton instance
module.exports = new Cache();
