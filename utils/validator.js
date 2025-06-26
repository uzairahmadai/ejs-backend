const { body, validationResult } = require('express-validator');
const config = require('../config/config');

class Validator {
    /**
     * Contact form validation rules
     */
    static contactRules() {
        return [
            body('name')
                .trim()
                .notEmpty().withMessage('Name is required')
                .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
            
            body('email')
                .trim()
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Please enter a valid email address')
                .normalizeEmail(),
            
            body('phone')
                .trim()
                .optional()
                .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/)
                .withMessage('Please enter a valid phone number'),
            
            body('message')
                .trim()
                .notEmpty().withMessage('Message is required')
                .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
        ];
    }

    /**
     * Car listing validation rules
     */
    static carRules() {
        return [
            body('make')
                .trim()
                .notEmpty().withMessage('Make is required')
                .isLength({ min: 2, max: 50 }).withMessage('Make must be between 2 and 50 characters'),
            
            body('model')
                .trim()
                .notEmpty().withMessage('Model is required')
                .isLength({ min: 1, max: 50 }).withMessage('Model must be between 1 and 50 characters'),
            
            body('year')
                .trim()
                .notEmpty().withMessage('Year is required')
                .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
                .withMessage('Please enter a valid year'),
            
            body('price')
                .trim()
                .notEmpty().withMessage('Price is required')
                .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
            
            body('mileage')
                .trim()
                .optional()
                .isInt({ min: 0 }).withMessage('Mileage must be a positive number'),
            
            body('description')
                .trim()
                .optional()
                .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters')
        ];
    }

    /**
     * Newsletter subscription validation rules
     */
    static newsletterRules() {
        return [
            body('email')
                .trim()
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Please enter a valid email address')
                .normalizeEmail()
        ];
    }

    /**
     * Test drive request validation rules
     */
    static testDriveRules() {
        return [
            body('name')
                .trim()
                .notEmpty().withMessage('Name is required')
                .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
            
            body('email')
                .trim()
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Please enter a valid email address')
                .normalizeEmail(),
            
            body('phone')
                .trim()
                .notEmpty().withMessage('Phone number is required')
                .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/)
                .withMessage('Please enter a valid phone number'),
            
            body('preferredDate')
                .trim()
                .notEmpty().withMessage('Preferred date is required')
                .isISO8601().withMessage('Please enter a valid date'),
            
            body('carId')
                .trim()
                .notEmpty().withMessage('Car selection is required')
                .isMongoId().withMessage('Invalid car selection')
        ];
    }

    /**
     * Loan calculator validation rules
     */
    static loanCalculatorRules() {
        return [
            body('vehiclePrice')
                .trim()
                .notEmpty().withMessage('Vehicle price is required')
                .isFloat({ min: 0 }).withMessage('Vehicle price must be a positive number'),
            
            body('downPayment')
                .trim()
                .notEmpty().withMessage('Down payment is required')
                .isFloat({ min: 0 }).withMessage('Down payment must be a positive number'),
            
            body('interestRate')
                .trim()
                .notEmpty().withMessage('Interest rate is required')
                .isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
            
            body('loanTerm')
                .trim()
                .notEmpty().withMessage('Loan term is required')
                .isInt({ min: 1, max: 10 }).withMessage('Loan term must be between 1 and 10 years')
        ];
    }

    /**
     * Search filters validation rules
     */
    static searchRules() {
        return [
            body('make').trim().optional(),
            body('model').trim().optional(),
            body('yearFrom')
                .optional()
                .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
                .withMessage('Please enter a valid year'),
            body('yearTo')
                .optional()
                .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
                .withMessage('Please enter a valid year'),
            body('priceFrom')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('Minimum price must be a positive number'),
            body('priceTo')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('Maximum price must be a positive number')
        ];
    }

    /**
     * Handle validation errors
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static handleErrors(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(422).json({ errors: errors.array() });
            }
            // Store errors in flash messages for web forms
            req.flash('errors', errors.array());
            return res.redirect('back');
        }
        next();
    }

    /**
     * Sanitize and validate file upload
     * @param {Object} file - Uploaded file object
     * @returns {boolean|string} True if valid, error message if invalid
     */
    static validateFileUpload(file) {
        // Check file size
        if (file.size > config.upload.maxFileSize) {
            return `File size exceeds ${config.upload.maxFileSize / 1024 / 1024}MB limit`;
        }

        // Check file type
        const ext = file.originalname.split('.').pop().toLowerCase();
        if (!config.upload.allowedTypes.includes(ext)) {
            return `File type .${ext} is not allowed`;
        }

        return true;
    }

    /**
     * Validate MongoDB ObjectId
     * @param {string} id - ID to validate
     * @returns {boolean} True if valid
     */
    static isValidObjectId(id) {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = Validator;
