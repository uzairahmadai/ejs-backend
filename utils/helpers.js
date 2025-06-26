const config = require('../config/config');

const helpers = {
    /**
     * Format currency with proper symbol and decimals
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} Formatted currency string
     */
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format date to localized string
     * @param {Date|string} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date string
     */
    formatDate: (date, options = {}) => {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @returns {string} Truncated text
     */
    truncateText: (text, length = 100) => {
        if (!text || text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    },

    /**
     * Generate URL-friendly slug from string
     * @param {string} text - Text to slugify
     * @returns {string} URL-friendly slug
     */
    slugify: (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    },

    /**
     * Get file extension from filename
     * @param {string} filename - Name of the file
     * @returns {string} File extension
     */
    getFileExtension: (filename) => {
        return filename.split('.').pop().toLowerCase();
    },

    /**
     * Generate random string
     * @param {number} length - Length of string
     * @returns {string} Random string
     */
    generateRandomString: (length = 10) => {
        return Math.random().toString(36).substring(2, length + 2);
    },

    /**
     * Validate email address format
     * @param {string} email - Email address to validate
     * @returns {boolean} True if valid
     */
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Calculate loan payment
     * @param {number} principal - Loan amount
     * @param {number} rate - Annual interest rate (as percentage)
     * @param {number} years - Loan term in years
     * @returns {number} Monthly payment amount
     */
    calculateLoanPayment: (principal, rate, years) => {
        const monthlyRate = (rate / 100) / 12;
        const numberOfPayments = years * 12;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    },

    /**
     * Format phone number
     * @param {string} phone - Phone number to format
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber: (phone) => {
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone;
    },

    /**
     * Get relative time string
     * @param {Date|string} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTimeString: (date) => {
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
        return helpers.formatDate(date);
    },

    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size string
     */
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Generate pagination object
     * @param {number} total - Total number of items
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @returns {Object} Pagination object
     */
    getPagination: (total, page = 1, limit = 10) => {
        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.min(Math.max(1, page), totalPages);
        
        return {
            total,
            currentPage,
            totalPages,
            limit,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            prevPage: currentPage > 1 ? currentPage - 1 : null,
            skip: (currentPage - 1) * limit
        };
    },

    /**
     * Get site URL with path
     * @param {string} path - Path to append
     * @returns {string} Full URL
     */
    getSiteUrl: (path = '') => {
        return `${config.server.url}${path}`;
    },

    /**
     * Check if string contains HTML
     * @param {string} text - Text to check
     * @returns {boolean} True if contains HTML
     */
    containsHtml: (text) => {
        const re = /<[^>]*>/;
        return re.test(text);
    },

    /**
     * Sanitize HTML string
     * @param {string} html - HTML to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml: (html) => {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#039;');
    },

    /**
     * Escapes regex special characters
     * @param {string} text - Input string
     * @returns {string} Escaped string
     */
    escapeRegex: (text) => {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Validates and converts price values
     * @param {string|number} value - Price value
     * @returns {number|null} Validated number or null
     */
    sanitizePrice: (value) => {
        const num = Number(value);
        return !isNaN(num) && num >= 0 ? num : null;
    }
};

module.exports = helpers;
