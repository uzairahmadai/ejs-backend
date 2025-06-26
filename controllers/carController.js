const Car = require('../models/Car');
const carService = require('../services/carService');
const { getPagination } = require('../utils/helpers');

exports.getCars = async (req, res) => {
    const { query } = req;
    const { page = 1, limit = 12 } = query;

    // Get all data in parallel
    const [results, filterOptions] = await Promise.all([
        carService.getPaginatedCars(query),
        carService.getFilterOptions()
    ]);

    const { cars, total, priceRange, counts } = results;
    const pagination = getPagination(total, page, limit);
    
    res.render('cars', {
        title: 'Car Listings',
        cars,
        totalCars: total,
        currentPage: pagination.currentPage,
        pages: pagination.totalPages,
        hasMore: pagination.hasNext,
        ...filterOptions,
        priceRange: priceRange || { min: 0, max: 100000 },
        query,
        ...counts,
        sort: query.sort || 'newest',
        meta: {
            title: 'Browse Cars | Find Your Perfect Vehicle',
            description: 'Browse our extensive collection of quality vehicles. Filter by make, model, price, and more to find your perfect car.',
            keywords: 'cars, vehicles, auto listings, car search, find cars'
        }
    });
};

exports.getCarDetails = async (req, res) => {
    const car = await carService.getCarBySlug(req.params.slug);
    if (!car) {
        return res.status(404).render('error', {
            title: 'Car Not Found',
            message: 'The car you are looking for does not exist or has been removed.',
            meta: {
                title: '404 - Car Not Found',
                robots: 'noindex, nofollow'
            }
        });
    }

    const [_, relatedCars] = await Promise.all([
        carService.incrementCarViews(car._id),
        carService.getRelatedCars(car)
    ]);

    const viewData = carService.buildCarDetailsData(car, relatedCars, req);
    viewData.meta = {
        title: `${car.year} ${car.make} ${car.model} | Detailed Specs and Features`,
        description: car.description.substring(0, 160),
        keywords: `${car.make}, ${car.model}, ${car.year}, ${car.color}, used car, car details`,
        image: car.images[0],
        canonical: `${req.protocol}://${req.get('host')}/cars/${car.slug}`
    };

    res.render('car-details', viewData);
};

exports.apiFilterCars = async (req, res) => {
    const results = await carService.getFilteredCars(req.query);
    const { cars, total, currentPage, pages } = results;

    res.json({
        success: true,
        data: {
            cars,
            pagination: {
                total,
                currentPage,
                totalPages: pages,
                hasMore: total > (currentPage * req.query.limit || 12)
            }
        }
    });
};
