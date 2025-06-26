const Car = require('../models/Car');

/**
 * Gets price range for filtered cars
 * @param {Object} filter - MongoDB filter object
 * @returns {Object} Price range with min and max
 */
const getPriceRange = async (filter = {}) => {
    try {
        const priceStats = await Car.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        if (priceStats.length > 0) {
            return {
                min: priceStats[0].minPrice || 0,
                max: priceStats[0].maxPrice || 100000
            };
        }

        return { min: 0, max: 100000 };
    } catch (error) {
        console.error('Error getting price range:', error);
        return { min: 0, max: 100000 };
    }
};

/**
 * Gets unique values for filter options
 * @returns {Object} Filter options
 */
const getFilterOptions = async () => {
    try {
        const [makes, models, colors] = await Promise.all([
            Car.distinct('make'),
            Car.distinct('model'),
            Car.distinct('color')
        ]);

        return {
            makes: makes.sort(),
            models: models.sort(),
            colors: colors.sort(),
            seats: [2, 4, 5, 7, 8]
        };
    } catch (error) {
        console.error('Error getting filter options:', error);
        return {
            makes: [],
            models: [],
            colors: [],
            seats: [2, 4, 5, 7, 8]
        };
    }
};

/**
 * Gets car statistics
 * @returns {Object} Car statistics
 */
const getCarStats = async () => {
    try {
        const stats = await Car.aggregate([
            {
                $group: {
                    _id: null,
                    totalCars: { $sum: 1 },
                    availableCars: {
                        $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
                    },
                    avgPrice: { $avg: '$price' },
                    avgMileage: { $avg: '$mileage' }
                }
            }
        ]);

        if (stats.length > 0) {
            return {
                total: stats[0].totalCars,
                available: stats[0].availableCars,
                avgPrice: Math.round(stats[0].avgPrice || 0),
                avgMileage: Math.round(stats[0].avgMileage || 0)
            };
        }

        return { total: 0, available: 0, avgPrice: 0, avgMileage: 0 };
    } catch (error) {
        console.error('Error getting car stats:', error);
        return { total: 0, available: 0, avgPrice: 0, avgMileage: 0 };
    }
};

module.exports = {
    getPriceRange,
    getFilterOptions,
    getCarStats
};
