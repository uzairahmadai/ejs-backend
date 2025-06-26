const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const logger = require('./logger');

class Security {
    constructor() {
        this.saltRounds = 10;
        this.tokenExpiration = '1d';
    }

    /**
     * Hash password
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            return bcrypt.hash(password, salt);
        } catch (error) {
            logger.error('Password hashing error:', error);
            throw error;
        }
    }

    /**
     * Compare password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if match
     */
    async comparePassword(password, hash) {
        try {
            return bcrypt.compare(password, hash);
        } catch (error) {
            logger.error('Password comparison error:', error);
            throw error;
        }
    }

    /**
     * Generate JWT token
     * @param {Object} payload - Token payload
     * @param {string} expiresIn - Token expiration
     * @returns {string} JWT token
     */
    generateToken(payload, expiresIn = this.tokenExpiration) {
        try {
            return jwt.sign(payload, config.security.jwtSecret, { expiresIn });
        } catch (error) {
            logger.error('Token generation error:', error);
            throw error;
        }
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, config.security.jwtSecret);
        } catch (error) {
            logger.error('Token verification error:', error);
            throw error;
        }
    }

    /**
     * Generate random token
     * @param {number} bytes - Number of bytes
     * @returns {string} Random token
     */
    generateRandomToken(bytes = 32) {
        try {
            return crypto.randomBytes(bytes).toString('hex');
        } catch (error) {
            logger.error('Random token generation error:', error);
            throw error;
        }
    }

    /**
     * Generate password reset token
     * @returns {Object} Reset token and expiry
     */
    generateResetToken() {
        const resetToken = this.generateRandomToken();
        const resetExpires = Date.now() + 3600000; // 1 hour
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        return {
            resetToken,
            hashedToken,
            resetExpires
        };
    }

    /**
     * Hash reset token
     * @param {string} token - Reset token
     * @returns {string} Hashed token
     */
    hashResetToken(token) {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    /**
     * Generate CSRF token
     * @returns {string} CSRF token
     */
    generateCSRFToken() {
        return this.generateRandomToken();
    }

    /**
     * Sanitize user input
     * @param {string} input - User input
     * @returns {string} Sanitized input
     */
    sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '')  // Remove < and >
            .replace(/&/g, '&amp;')
            .replace(/"/g, '"')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Generate secure random string
     * @param {number} length - String length
     * @returns {string} Random string
     */
    generateSecureString(length = 32) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        const randomBytes = crypto.randomBytes(length);
        const result = new Array(length);
        const charsLength = chars.length;

        for (let i = 0; i < length; i++) {
            result[i] = chars[randomBytes[i] % charsLength];
        }

        return result.join('');
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    validatePasswordStrength(password) {
        const result = {
            isValid: false,
            errors: []
        };

        if (password.length < 8) {
            result.errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            result.errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            result.errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            result.errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*]/.test(password)) {
            result.errors.push('Password must contain at least one special character (!@#$%^&*)');
        }

        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Generate API key
     * @returns {string} API key
     */
    generateApiKey() {
        return `ak_${this.generateRandomToken(24)}`;
    }

    /**
     * Encrypt data
     * @param {string} data - Data to encrypt
     * @param {string} key - Encryption key
     * @returns {string} Encrypted data
     */
    encrypt(data, key) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypt data
     * @param {string} encryptedData - Data to decrypt
     * @param {string} key - Encryption key
     * @returns {string} Decrypted data
     */
    decrypt(encryptedData, key) {
        const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
        
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(key, 'hex'),
            Buffer.from(ivHex, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Generate secure filename
     * @param {string} originalFilename - Original filename
     * @returns {string} Secure filename
     */
    generateSecureFilename(originalFilename) {
        const ext = originalFilename.split('.').pop();
        return `${this.generateRandomToken(16)}.${ext}`;
    }
}

// Export singleton instance
module.exports = new Security();
