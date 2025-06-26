const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const searchController = require('../controllers/searchController');
// Main pages
router.get('/', pageController.getHomePage);
router.get('/about', pageController.renderAbout);
router.get('/contact', pageController.renderContact);
router.get('/service', pageController.renderService);
router.get('/team', pageController.renderTeam);
router.get('/faq', pageController.renderFaq);

// Search functionality
router.get('/search', searchController.searchCars);

// Blog routes
router.get('/blog', pageController.renderBlog);
router.get('/blog-details', pageController.renderBlogDetails);

// Additional pages
router.get('/account', pageController.renderAccount);
router.get('/calculator', pageController.renderCalculator);
router.get('/car-dealer', pageController.renderCarDealer);
router.get('/sold-car', pageController.renderSoldCar);
// Error handling
router.use(pageController.renderError);

module.exports = router;
