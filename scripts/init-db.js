const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');
const Car = require('../models/Car');
const Contact = require('../models/Contact');

// Sample car data
const cars = [
    {
        make: 'BMW',
        model: '7 Series',
        year: 2023,
        price: 95000,
        mileage: 0,
        color: 'Black Sapphire',
        fuelType: 'Hybrid',
        transmission: 'Automatic',
        description: 'Luxury sedan with advanced technology and comfort features.',
        features: [
            'Panoramic Sunroof',
            'Leather Interior',
            'Navigation System',
            'Parking Assistant',
            'Heated Seats'
        ],
        images: [
            '/assets/images/cars/bmw-7-series-1.jpg',
            '/assets/images/cars/bmw-7-series-2.jpg'
        ],
        status: 'available'
    },
    {
        make: 'Mercedes-Benz',
        model: 'S-Class',
        year: 2023,
        price: 110000,
        mileage: 500,
        color: 'Selenite Grey',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        description: 'Flagship luxury vehicle with exceptional comfort and performance.',
        features: [
            'MBUX Infotainment System',
            'Air Suspension',
            'Premium Sound System',
            'Driver Assistance Package',
            'Massage Seats'
        ],
        images: [
            '/assets/images/cars/mercedes-s-class-1.jpg',
            '/assets/images/cars/mercedes-s-class-2.jpg'
        ],
        status: 'available'
    },
    {
        make: 'Porsche',
        model: '911 GT3',
        year: 2023,
        price: 175000,
        mileage: 100,
        color: 'Racing Yellow',
        fuelType: 'Petrol',
        transmission: 'Manual',
        description: 'High-performance sports car built for both track and road use.',
        features: [
            'Sport Chrono Package',
            'Carbon Ceramic Brakes',
            'Sport Exhaust System',
            'Bucket Seats',
            'Track Telemetry'
        ],
        images: [
            '/assets/images/cars/porsche-911-gt3-1.jpg',
            '/assets/images/cars/porsche-911-gt3-2.jpg'
        ],
        status: 'available'
    }
];

// Sample contact data
const contacts = [
    {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        message: 'Interested in the BMW 7 Series. Please contact me for a test drive.',
        status: 'pending'
    },
    {
        name: 'Emma Johnson',
        email: 'emma.johnson@example.com',
        phone: '+1987654321',
        message: 'Looking for more information about the Mercedes S-Class financing options.',
        status: 'pending'
    }
];

async function initDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.database.uri, config.database.options);
        logger.info('Connected to MongoDB successfully');

        // Clear existing data
        await Promise.all([
            Car.deleteMany({}),
            Contact.deleteMany({})
        ]);
        logger.info('Cleared existing data');

        // Insert new data
        await Promise.all([
            Car.insertMany(cars),
            Contact.insertMany(contacts)
        ]);
        logger.info('Inserted sample data successfully');

        // Create indexes
        await Promise.all([
            Car.createIndexes(),
            Contact.createIndexes()
        ]);
        logger.info('Created indexes successfully');

        logger.info('Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Handle process events
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Run initialization
initDatabase();
