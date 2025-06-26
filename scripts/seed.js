require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');

const cars = [
    {
        title: "2023 Mercedes-Benz AMG GT",
        slug: "2023-mercedes-benz-amg-gt",
        make: "Mercedes-Benz",
        model: "AMG GT",
        price: 135000,
        tag: "New",
        images: ["/assets/images/portfolio/01.webp"],
        overview: {
            mileage: "100",
            fuelType: "Gasoline",
            transmission: "Automatic",
            seats: 2,
            color: "Matte Black"
        }
    },
    {
        title: "2023 BMW M4 Competition",
        slug: "2023-bmw-m4-competition",
        make: "BMW",
        model: "M4",
        price: 85000,
        tag: "Featured",
        images: ["/assets/images/portfolio/02.webp"],
        overview: {
            mileage: "500",
            fuelType: "Gasoline",
            transmission: "Manual",
            seats: 4,
            color: "Orange"
        }
    },
    {
        title: "2023 Audi RS e-tron GT",
        slug: "2023-audi-rs-etron-gt",
        make: "Audi",
        model: "RS e-tron GT",
        price: 145000,
        tag: "Electric",
        images: ["/assets/images/portfolio/03.webp"],
        overview: {
            mileage: "0",
            fuelType: "Electric",
            transmission: "Automatic",
            seats: 4,
            color: "Black"
        }
    },
    {
        title: "2023 Tesla Model S Plaid",
        slug: "2023-tesla-model-s-plaid",
        make: "Tesla",
        model: "Model S",
        price: 125000,
        tag: "Electric",
        images: ["/assets/images/portfolio/04.webp"],
        overview: {
            mileage: "200",
            fuelType: "Electric",
            transmission: "Automatic",
            seats: 5,
            color: "Yellow"
        }
    },
    {
        title: "2023 Lamborghini Huracán",
        slug: "2023-lamborghini-huracan",
        make: "Lamborghini",
        model: "Huracán",
        price: 275000,
        tag: "Supercar",
        images: ["/assets/images/portfolio/05.webp"],
        overview: {
            mileage: "50",
            fuelType: "Gasoline",
            transmission: "Automatic",
            seats: 2,
            color: "Neon Colors"
        }
    },
    {
        title: "2023 Honda Civic Type R",
        slug: "2023-honda-civic-type-r",
        make: "Honda",
        model: "Civic",
        price: 45000,
        tag: "Sport",
        images: ["/assets/images/portfolio/06.webp"],
        overview: {
            mileage: "1000",
            fuelType: "Gasoline",
            transmission: "Manual",
            seats: 4,
            color: "Black"
        }
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autovault', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Car.deleteMany({});
    console.log('Cleared existing cars');
    
    // Insert new data
    await Car.insertMany(cars);
    console.log('Database seeded with sample cars!');
    
    process.exit();
})
.catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
});
