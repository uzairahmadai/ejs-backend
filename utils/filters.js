const { escapeRegex } = require('./helpers');

module.exports = {
    /**
     * Builds MongoDB filter from query parameters
     * @param {Object} query - Express request query object
     * @returns {Object} MongoDB filter
     */
    buildCarFilter: (query) => {
        const filter = {};
        
        // Text filters
        if (query.make) {
            filter.make = sanitizeFilterInput(query.make, true);
            filter.make = Array.isArray(filter.make) ? { $in: filter.make } : filter.make;
        }
        
        if (query.model) {
            filter.model = sanitizeFilterInput(query.model, true);
            filter.model = Array.isArray(filter.model) ? { $in: filter.model } : filter.model;
        }
        
        if (query.color) {
            filter.color = sanitizeFilterInput(query.color, true);
            filter.color = Array.isArray(filter.color) ? { $in: filter.color } : filter.color;
        }
        
        // Numeric filters
        if (query.seats) {
            if (Array.isArray(query.seats)) {
                filter.seats = { $in: query.seats.map(Number).filter(n => !isNaN(n)) };
            } else if (!isNaN(query.seats)) {
                filter.seats = Number(query.seats);
            }
        }
        
        // Price range
        if (query.minPrice || query.maxPrice) {
            filter.price = {};
            if (query.minPrice && !isNaN(query.minPrice)) {
                filter.price.$gte = Number(query.minPrice);
            }
            if (query.maxPrice && !isNaN(query.maxPrice)) {
                filter.price.$lte = Number(query.maxPrice);
            }
        }
        
        // Status filter
        if (query.status) {
            filter.status = query.status;
        } else {
            filter.status = 'Available'; // Default filter
        }
        
        // Search term
        if (query.search) {
            const searchTerm = new RegExp(escapeRegex(query.search), 'i');
            filter.$or = [
                { make: searchTerm },
                { model: searchTerm },
                { description: searchTerm },
                { 'dealer.name': searchTerm }
            ];
        }
        
        return filter;
    },
    
    /**
     * Determines sort order based on query parameter
     * @param {string} sortQuery - Sort parameter from URL
     * @returns {Object} MongoDB sort object
     */
    determineCarSort: (sortQuery) => {
        const sortOptions = {
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            'mileage-asc': { mileage: 1 },
            'mileage-desc': { mileage: -1 },
            'newest': { createdAt: -1 },
            'oldest': { createdAt: 1 },
            'views': { views: -1 },
            'favorites': { favorites: -1 }
        };
        return sortOptions[sortQuery] || { createdAt: -1 }; // Default sort
    },
    
    /**
     * Sanitizes filter input values
     * @param {string|Array} value - Input value
     * @param {boolean} forceArray - Convert to array
     * @returns {string|Array|null} Sanitized value
     */
    sanitizeFilterInput: (value, forceArray = false) => {
        if (!value) return null;
        if (forceArray && !Array.isArray(value)) return [value];
        return value;
    }
};

/**
 * Sanitizes filter input values
 * @param {string|Array} value - Input value
 * @param {boolean} forceArray - Convert to array
 * @returns {string|Array|null} Sanitized value
 */
function sanitizeFilterInput(value, forceArray = false) {
    if (!value) return null;
    if (forceArray && !Array.isArray(value)) return [value];
    return value;
}
