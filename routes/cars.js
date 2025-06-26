const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const inquiryController = require('../controllers/inquiryController');
const { validateInquiry } = require('../validators/inquiryValidator');
const rateLimit = require('express-rate-limit');

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later' }
});

// Error handling middleware
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Main routes
router.get('/', asyncHandler(carController.getCars));
router.get('/filter', apiLimiter, asyncHandler(carController.apiFilterCars));
router.get('/:slug', asyncHandler(carController.getCarDetails));

// Inquiry form submission
router.post(
    '/:slug/inquiry',
    validateInquiry,
    asyncHandler(inquiryController.submitInquiry)
);

// Error handler
router.use((err, req, res, next) => {
    console.error('Cars route error:', err);
    if (req.xhr || req.headers.accept.includes('json')) {
        res.status(500).json({ 
            error: 'Server error', 
            message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred' 
        });
    } else {
        res.status(500).render('error', { 
            title: 'Server Error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
        });
    }
});

module.exports = router;
