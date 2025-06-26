const Car = require('../models/Car');
const { buildCarFilter, determineCarSort } = require('../utils/filters');
const { getPriceRange } = require('../utils/carUtils');

module.exports = {
    // Main data fetching methods
    getPaginatedCars: async (query) => {
        try {
            const filter = buildCarFilter(query);
            const sort = determineCarSort(query.sort);
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 12;
            
            const [cars, total, priceRange] = await Promise.all([
                Car.find(filter)
                    .sort(sort)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('dealer', 'name avatar')
                    .lean(),
                Car.countDocuments(filter),
                getPriceRange(filter)
            ]);
            
            return {
                cars,
                total,
                priceRange,
                hasMore: total > page * limit,
                currentPage: page,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw new Error(`Error fetching cars: ${error.message}`);
        }
    },

    getFilteredCars: async (query) => {
        try {
            const filter = buildCarFilter(query);
            const sort = determineCarSort(query.sort);
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 12;

            const [cars, totalCars] = await Promise.all([
                Car.find(filter)
                    .sort(sort)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('dealer', 'name avatar')
                    .lean(),
                Car.countDocuments(filter)
            ]);

            return { 
                cars, 
                totalCars, 
                hasMore: totalCars > (page * limit),
                currentPage: page,
                pages: Math.ceil(totalCars / limit)
            };
        } catch (error) {
            throw new Error(`Error fetching filtered cars: ${error.message}`);
        }
    },

    // Single car operations
    getCarBySlug: async (slug) => {
        return Car.findOne({ slug }).populate('dealer').lean();
    },

    incrementCarViews: async (carId) => {
        return Car.updateOne({ _id: carId }, { $inc: { views: 1 } });
    },

    // Related data fetchers
    getRelatedCars: async (car) => {
        return Car.find({
            make: car.make,
            _id: { $ne: car._id },
            status: 'Available',
            price: { $gte: car.price * 0.8, $lte: car.price * 1.2 }
        })
        .limit(4)
        .sort({ createdAt: -1 })
        .lean();
    },

    getFilterOptions: async () => {
        try {
            const [makes, models, colors, seats, fuelTypes] = await Promise.all([
                Car.distinct('make'),
                Car.distinct('model'),
                Car.distinct('color'),
                Car.distinct('seats'),
                Car.distinct('fuelType')
            ]);

            return {
                makes: makes.sort(),
                models: models.sort(),
                colors: colors.sort(),
                seats: seats.sort((a, b) => a - b),
                fuelTypes
            };
        } catch (error) {
            throw new Error(`Error fetching filter options: ${error.message}`);
        }
    },

    // Presentation logic
    buildCarDetailsData: (car, relatedCars, req) => ({
        title: `${car.make} ${car.model} ${car.year}`,
        car,
        relatedCars,
        currentUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        metaDescription: `${car.make} ${car.model} for sale. ${car.description.substring(0, 160)}...`,
        metaKeywords: `${car.make}, ${car.model}, ${car.year}, ${car.color}`
    })
};

// Helpers (could be moved to utils/helpers.js)
function sanitizeFilterInput(value, isArray = false) {
    if (!value) return null;
    if (isArray && !Array.isArray(value)) return [value];
    return value;
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}