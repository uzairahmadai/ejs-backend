const Car = require('../models/Car');

// Static data (same as in pageController)
const staticCars = [
    {
        title: '2024 BMW X5',
        slug: '2024-bmw-x5',
        make: 'BMW',
        model: 'X5',
        price: 65000,
        tag: 'New',
        images: ['/assets/images/portfolio/04.webp', '/assets/images/portfolio/04-big.webp'],
        overview: {
            mileage: '0 miles',
            fuelType: 'Gasoline',
            transmission: 'Automatic',
            seats: 5,
            color: 'Alpine White'
        },
        features: ['Leather Seats', 'Navigation', 'Sunroof']
    },
    {
        title: '2023 Tesla Model 3',
        slug: '2023-tesla-model-3',
        make: 'Tesla',
        model: 'Model 3',
        price: 45000,
        tag: 'Featured',
        images: ['/assets/images/portfolio/05.webp', '/assets/images/portfolio/05-sm.webp'],
        overview: {
            mileage: '1,200 miles',
            fuelType: 'Electric',
            transmission: 'Automatic',
            seats: 5,
            color: 'Red'
        },
        features: ['Autopilot', 'Premium Audio', 'Glass Roof']
    }
];

exports.searchCars = async (req, res) => {
    try {
        const { 
            make,
            model,
            price,
            location,
            type
        } = req.query;

        let cars;
        let makes;
        let models;
        let totalCars;

        if (global.isStaticMode) {
            // Filter static cars
            cars = staticCars.filter(car => {
                if (make && car.make !== make) return false;
                if (model && car.model !== model) return false;
                if (price && car.price > parseInt(price)) return false;
                if (type === 'used' && car.tag !== 'Used') return false;
                if (type !== 'used' && car.tag !== 'New') return false;
                return true;
            }).sort((a, b) => a.price - b.price);

            // Get distinct values from static data
            makes = [...new Set(staticCars.map(car => car.make))];
            models = [...new Set(staticCars.map(car => car.model))];
            totalCars = staticCars.length;
        } else {
            // Build MongoDB query
            const filter = {};
            if (make) filter.make = make;
            if (model) filter.model = model;
            if (price) filter.price = { $lte: parseInt(price) };
            if (type === 'used') filter.tag = 'Used';
            else filter.tag = 'New';

            // Get cars with filters
            cars = await Car.find(filter).sort({ price: 1 });
            makes = await Car.distinct('make');
            models = await Car.distinct('model');
            totalCars = await Car.countDocuments();
        }

        const locations = ['USA', 'UK', 'Canada', 'Australia', 'China'];
        const prices = [22000, 27000, 30000, 32000, 38000];

        // Render the search results page
        res.locals.page = 'search';
        res.render('search-results', {
            title: 'Search Results - AutoVault',
            cars,
            filters: {
                makes,
                models,
                locations,
                prices,
                selectedMake: make,
                selectedModel: model,
                selectedPrice: price,
                selectedLocation: location,
                selectedType: type
            },
            totalResults: cars.length,
            totalCars
        });
    } catch (error) {
        console.error('Error in searchCars:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to perform search'
        });
    }
};
