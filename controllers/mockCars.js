// Mock car data to simulate database
const cars = [
  {
    id: 1,
    title: 'Mercedes-Benz E-Class',
    price: 14000,
    mileage: '100 Miles',
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: '/assets/images/portfolio/30.webp',
    images: [
      '/assets/images/portfolio/30.webp',
      '/assets/images/portfolio/31.webp',
      '/assets/images/portfolio/32.webp',
      '/assets/images/portfolio/33.webp',
      '/assets/images/portfolio/34.webp',
      '/assets/images/portfolio/35.webp'
    ],
    slug: 'mercedes-benz-e-class',
    features: ['100 Miles', 'Petrol', 'Automatic', '5 Person'],
    category: 'Luxury',
    tag: 'New',
    description: 'The Mercedes-Benz E-Class is a range of executive cars manufactured by German automaker Mercedes-Benz. Packed with innovative technology and luxurious comfort features.',
    specs: {
      engine: 'V6 3.0L',
      horsepower: '362 hp',
      torque: '369 lb-ft',
      transmission: '9-speed automatic',
      driveType: 'All-wheel drive',
      seating: '5 passengers',
      fuelEconomy: '22 city / 29 highway',
      batteryCapacity: '100 kWh',
      chargingTime: {
        levelTwo: '15 hrs',
        dcFast: '30 mins'
      },
      warranty: {
        battery: '96 month/150000 miles',
        powertrain: '96 month/unlimited'
      }
    },
    engineDetails: {
      displacement: '3L',
      torque: '350 lb.-ft',
      horsepower: '210 kW / 286 hp',
      cylinders: '4',
      layout: 'First-Engine',
      configuration: 'V Engine (V6, V8)'
    },
    overview: {
      type: 'Mercedes - Benz',
      mileage: '100 Miles',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seating: '5 Person',
      driveType: 'Race Car Drivers',
      engine: 'Mazda RX-7',
      color: 'Red Color'
    },
    dealer: {
      name: 'Jonathon Doe',
      role: 'Car Dealer',
      image: '/assets/images/portfolio/author.webp',
      phone: '+14844578513',
      whatsapp: '+18143511443'
    }
  },
  {
    id: 2,
    title: 'BMW 7 Series',
    price: 16500,
    mileage: '50 Miles',
    fuel: 'Hybrid',
    transmission: 'Automatic',
    image: '/assets/images/portfolio/31.webp',
    images: [
      '/assets/images/portfolio/31.webp',
      '/assets/images/portfolio/32.webp',
      '/assets/images/portfolio/33.webp',
      '/assets/images/portfolio/34.webp'
    ],
    slug: 'bmw-7-series',
    features: ['50 Miles', 'Hybrid', 'Automatic', '5 Person'],
    category: 'Luxury',
    tag: 'Featured',
    description: 'The BMW 7 Series is a full-size luxury sedan produced by the German automaker BMW. Known for its cutting-edge technology and superior comfort.',
    specs: {
      engine: 'Twin-turbo 4.4L V8',
      horsepower: '523 hp',
      torque: '553 lb-ft',
      transmission: '8-speed automatic',
      driveType: 'All-wheel drive',
      seating: '5 passengers',
      fuelEconomy: '17 city / 24 highway',
      batteryCapacity: '100 kWh',
      chargingTime: {
        levelTwo: '15 hrs',
        dcFast: '30 mins'
      },
      warranty: {
        battery: '96 month/150000 miles',
        powertrain: '96 month/unlimited'
      }
    },
    engineDetails: {
      displacement: '4.4L',
      torque: '553 lb.-ft',
      horsepower: '385 kW / 523 hp',
      cylinders: '8',
      layout: 'Front-Engine',
      configuration: 'V Engine (V8)'
    },
    overview: {
      type: 'BMW',
      mileage: '50 Miles',
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      seating: '5 Person',
      driveType: 'All-wheel drive',
      engine: 'Twin-turbo V8',
      color: 'Black'
    },
    dealer: {
      name: 'Jonathon Doe',
      role: 'Car Dealer',
      image: '/assets/images/portfolio/author.webp',
      phone: '+14844578513',
      whatsapp: '+18143511443'
    }
  },
  {
    id: 3,
    title: 'Audi A8',
    price: 15800,
    mileage: '75 Miles',
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: '/assets/images/portfolio/32.webp',
    images: [
      '/assets/images/portfolio/32.webp',
      '/assets/images/portfolio/33.webp',
      '/assets/images/portfolio/34.webp',
      '/assets/images/portfolio/35.webp'
    ],
    slug: 'audi-a8',
    features: ['75 Miles', 'Petrol', 'Automatic', '5 Person'],
    category: 'Luxury',
    tag: 'Popular',
    description: 'The Audi A8 is a full-size luxury sedan manufactured and marketed by the German automaker Audi. Features advanced driver assistance systems and premium materials throughout.',
    specs: {
      engine: 'Twin-turbo 3.0L V6',
      horsepower: '335 hp',
      torque: '369 lb-ft',
      transmission: '8-speed automatic',
      driveType: 'Quattro all-wheel drive',
      seating: '5 passengers',
      fuelEconomy: '19 city / 27 highway',
      batteryCapacity: '100 kWh',
      chargingTime: {
        levelTwo: '15 hrs',
        dcFast: '30 mins'
      },
      warranty: {
        battery: '96 month/150000 miles',
        powertrain: '96 month/unlimited'
      }
    },
    engineDetails: {
      displacement: '3.0L',
      torque: '369 lb.-ft',
      horsepower: '250 kW / 335 hp',
      cylinders: '6',
      layout: 'Front-Engine',
      configuration: 'V Engine (V6)'
    },
    overview: {
      type: 'Audi',
      mileage: '75 Miles',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seating: '5 Person',
      driveType: 'Quattro all-wheel drive',
      engine: 'Twin-turbo V6',
      color: 'Silver'
    },
    dealer: {
      name: 'Jonathon Doe',
      role: 'Car Dealer',
      image: '/assets/images/portfolio/author.webp',
      phone: '+14844578513',
      whatsapp: '+18143511443'
    }
  }
];

exports.getCars = (req, res) => {
  const { category } = req.query;
  let filteredCars = [...cars];
  
  if (category) {
    filteredCars = cars.filter(car => car.category === category);
  }
  
  res.json({
    success: true,
    data: filteredCars
  });
};

exports.getCarBySlug = (req, res) => {
  const { slug } = req.params;
  const car = cars.find(c => c.slug === slug);
  
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }
  
  // Get related cars (same category but different car)
  const relatedCars = cars.filter(c => c.category === car.category && c.id !== car.id).slice(0, 2);
  
  res.json({
    success: true,
    data: { car, relatedCars }
  });
};

// For internal use by controllers
exports.getAllCars = () => cars;
