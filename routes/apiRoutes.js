const express = require('express');
const router = express.Router();
const mockCars = require('../controllers/mockCars');
const mockContact = require('../controllers/mockContact');

// Car routes
router.get('/cars', mockCars.getCars);
router.get('/cars/:slug', mockCars.getCarBySlug);

// Contact form routes
router.post('/contact', mockContact.submitContact);
router.get('/contact/submissions', mockContact.getSubmissions); // For admin purposes

// Error handling for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = router;
