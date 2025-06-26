const Car = require('../models/Car');
const { getAllCars } = require('./mockCars');

// Initialize static data for when MongoDB is not available
const staticCars = getAllCars() || [
    {
        title: 'Thunderbolt Car',
        slug: 'thunderbolt-car',
        make: 'Thunderbolt',
        model: 'Sport',
        price: 14000,
        tag: 'New',
        images: ['/assets/images/portfolio/01.webp'],
        overview: {
            mileage: '100 Miles',
            fuelType: 'Petrol',
            transmission: 'Automatic',
            seats: 4,
            color: 'Red'
        }
    },
    {
        title: 'Volvo 1927',
        slug: 'volvo-1927',
        make: 'Volvo',
        model: 'Classic',
        price: 14300,
        tag: 'Used',
        images: ['/assets/images/portfolio/02.webp'],
        overview: {
            mileage: '105 Miles',
            fuelType: 'Petrol',
            transmission: 'Automatic',
            seats: 4,
            color: 'Black'
        }
    },
    {
        title: 'Volkswagen 1938',
        slug: 'volkswagen-1938',
        make: 'Volkswagen',
        model: 'Vintage',
        price: 14500,
        tag: 'Featured',
        images: ['/assets/images/portfolio/03.webp'],
        overview: {
            mileage: '110 Miles',
            fuelType: 'Petrol',
            transmission: 'Automatic',
            seats: 4,
            color: 'Blue'
        }
    }
];

exports.getHomePage = (req, res) => {
    const allCars = global.isStaticMode ? staticCars : [];
    
    // Helper function to format car data with rotating images
    const formatCar = (car, index) => ({
        title: car.title,
        price: `$${car.price.toLocaleString()}`,
        image: `/assets/images/portfolio/0${(index % 3) + 1}.webp`,  // Rotate through available images
        slug: car.slug,
        features: [
            car.overview.mileage,
            car.overview.fuelType,
            car.overview.transmission
        ]
    });

    // Map and categorize cars with rotating images
    const cars = allCars.map((car, index) => formatCar(car, index));
    const newCars = allCars.filter(car => car.tag === 'New').map((car, index) => formatCar(car, index));
    const usedCars = allCars.filter(car => car.tag === 'Used').map((car, index) => formatCar(car, index));
    const trendingCars = allCars.filter(car => car.tag === 'Featured').map((car, index) => formatCar(car, index));

    // Categories data
    const categories = [
      { icon: '/assets/images/category/01.svg', title: 'Hatchback', count: 30 },
      { icon: '/assets/images/category/02.svg', title: 'Minivans', count: 20 },
      { icon: '/assets/images/category/03.svg', title: 'Luxury Cars', count: 15 },
      { icon: '/assets/images/category/04.svg', title: 'Sedans', count: 25 },
      { icon: '/assets/images/category/05.svg', title: 'Convertible', count: 55 },
      { icon: '/assets/images/category/06.svg', title: 'Sports Car', count: 35 }
    ];

    // Get testimonials
    const testimonials = [
      {
        name: 'Sarah Martinez',
        role: 'CEO of Apex Solutions',
        rating: 4.5,
        review: 'Choosing AutoVault was one of the best decisions we\'ve ever made. They have proven to be a reliable and innovative partner, always ready to tackle new challenges with expertise.'
      },
      {
        name: 'Xavi Alonso',
        role: 'CEO of Apex Solutions',
        rating: 4.5,
        review: 'Choosing AutoVault was one of the best decisions we\'ve ever made. They have proven to be a reliable and innovative partner, always ready to tackle new challenges with expertise.'
      },
      {
        name: 'Jamal Musiala',
        role: 'Founder of Apex Solutions',
        rating: 4.5,
        review: 'Choosing AutoVault was one of the best decisions we\'ve ever made. They have proven to be a reliable and innovative partner, always ready to tackle new challenges with expertise.'
      }
    ];

    // Get latest blog posts
    const latestBlogs = [
      {
        title: 'Review the Latest Car Models And Compare Them With Similar Car Vehicles',
        date: 'March 26, 2024',
        image: '/assets/images/blog/01.webp'
      },
      {
        title: 'Focus on the rapidly growing market for electric vehicles and green cars.',
        date: 'March 26, 2024',
        image: '/assets/images/blog/02.webp'
      }
    ];

    // Featured cars data for feature section
    const featuredCars = [
      {
        title: "Thunderbolt Car",
        image: "/assets/images/feature/slider-01.webp",
        features: [
          { icon: "/assets/images/portfolio/feature-icon/01.svg", text: "100 Miles" },
          { icon: "/assets/images/portfolio/feature-icon/03.svg", text: "Automatic" },
          { icon: "/assets/images/portfolio/feature-icon/04.svg", text: "5 Person" },
        ],
      },
      {
        title: "Mazda MX-5 Miata",
        image: "/assets/images/feature/slider-02.webp",
        features: [
          { icon: "/assets/images/portfolio/feature-icon/01.svg", text: "100 Miles" },
          { icon: "/assets/images/portfolio/feature-icon/03.svg", text: "Automatic" },
          { icon: "/assets/images/portfolio/feature-icon/04.svg", text: "5 Person" },
        ],
      },
      {
        title: "Mercedes-Benz E-Class",
        image: "/assets/images/feature/slider-03.webp",
        features: [
          { icon: "/assets/images/portfolio/feature-icon/01.svg", text: "100 Miles" },
          { icon: "/assets/images/portfolio/feature-icon/03.svg", text: "Automatic" },
          { icon: "/assets/images/portfolio/feature-icon/04.svg", text: "5 Person" },
        ],
      },
      {
        title: "Honda Civic Hatchback",
        image: "/assets/images/feature/slider-04.webp",
        features: [
          { icon: "/assets/images/portfolio/feature-icon/01.svg", text: "100 Miles" },
          { icon: "/assets/images/portfolio/feature-icon/03.svg", text: "Automatic" },
          { icon: "/assets/images/portfolio/feature-icon/04.svg", text: "5 Person" },
        ],
      },
      {
        title: "Hyundai Veloster",
        image: "/assets/images/feature/slider-05.webp",
        features: [
          { icon: "/assets/images/portfolio/feature-icon/01.svg", text: "100 Miles" },
          { icon: "/assets/images/portfolio/feature-icon/03.svg", text: "Automatic" },
          { icon: "/assets/images/portfolio/feature-icon/04.svg", text: "5 Person" },
        ],
      },
    ];

    // Portfolio tabs data
    const portfolioTabs = {
      'new-cars': cars,
      'used': usedCars,
      'trending': trendingCars,
      'stocks': cars.slice().reverse()
    };

    res.locals.page = 'home';
    res.render('index', {
      title: 'AutoVault - Car Dealer',
      cars,
      newCars,
      usedCars,
      trendingCars,
      featuredCars,
      categories,
      testimonials,
      latestBlogs,
      portfolioTabs,
      stats: {
        carsSold: 1000,
        monthlyPayment: 122
      }
    });
};

exports.renderAbout = (req, res) => {
  res.locals.page = 'about';
  res.render('about', {
    title: 'About Us - AutoVault'
  });
};

exports.renderCars = async (req, res) => {
  try {
    const query = req.query;
    const filter = {};
    
    // Apply filters
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { make: { $regex: query.search, $options: 'i' } },
        { model: { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.make) {
      filter.make = Array.isArray(query.make) ? { $in: query.make } : query.make;
    }

    if (query.model) {
      filter.model = Array.isArray(query.model) ? { $in: query.model } : query.model;
    }

    if (query.seats) {
      filter['overview.seats'] = Array.isArray(query.seats) 
        ? { $in: query.seats.map(Number) } 
        : Number(query.seats);
    }

    if (query.color) {
      filter['overview.color'] = Array.isArray(query.color) ? { $in: query.color } : query.color;
    }

    if (query.fuel) {
      filter['overview.fuelType'] = Array.isArray(query.fuel) ? { $in: query.fuel } : query.fuel;
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    let cars;
    if (global.isStaticMode) {
      cars = staticCars;
    } else {
      cars = await Car.find(filter);
    }
    
    // Get all possible filter values
    const makes = global.isStaticMode ? [...new Set(staticCars.map(car => car.make))] : await Car.distinct('make');
    const models = global.isStaticMode ? [...new Set(staticCars.map(car => car.model))] : await Car.distinct('model');
    const colors = global.isStaticMode ? [...new Set(staticCars.map(car => car.overview.color))] : await Car.distinct('overview.color');
    const fuelTypes = global.isStaticMode ? [...new Set(staticCars.map(car => car.overview.fuelType))] : await Car.distinct('overview.fuelType');
    const seats = global.isStaticMode ? [...new Set(staticCars.map(car => car.overview.seats))] : await Car.distinct('overview.seats');

    res.locals.page = 'cars';
    res.render('cars', {
      title: 'Our Cars - AutoVault',
      cars,
      filters: {
        makes,
        models,
        colors,
        fuelTypes,
        seats
      },
      query,
      totalResults: cars.length,
      totalCars: global.isStaticMode ? staticCars.length : await Car.countDocuments()
    });
  } catch (error) {
    console.error('Error in renderCars:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load cars'
    });
  }
};

exports.renderCarDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    let car;
    let relatedCars;

    if (global.isStaticMode) {
      car = staticCars.find(c => c.slug === slug);
      relatedCars = staticCars
        .filter(c => c.make === car.make && c.slug !== car.slug)
        .slice(0, 2);
    } else {
      car = await Car.findOne({ slug });
      relatedCars = await Car.find({
        make: car.make,
        slug: { $ne: car.slug }
      }).limit(2);
    }

    if (!car) {
      return res.status(404).render('error', {
        title: '404 Not Found',
        message: 'Car not found'
      });
    }

    // Format the price
    const formattedPrice = car.price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    // Enrich car data
    const enrichedCar = {
      ...(global.isStaticMode ? car : car.toObject()),
      formattedPrice,
      features: car.features || [
        'Engine Type',
        'Horsepower',
        'Automatic Climate Control',
        'Touchscreen Display',
        'Navigation System',
        'Fog Lights',
        'Start-Stop Technology',
        'Automatic Headlights',
        'Navigation System'
      ],
      specs: car.specs || [
        { label: 'Car Transmission', value: car.overview.transmission },
        { label: 'Level Two Charging', value: '15 hrs' },
        { label: 'Battery Capacity', value: '100 kWh' },
        { label: 'Dc Fast Changing', value: '30 mins' },
        { label: 'Battery', value: '96 month/150000 miles' },
        { label: 'Powertrain', value: '96 month/unlimited' }
      ],
      engine: car.engine || [
        { label: 'Displacement', value: '3L' },
        { label: 'Torque', value: '350 lb.-ft' },
        { label: 'Horsepower', value: car.overview.horsepower || '210 kW / 286 hp' },
        { label: 'Number of cylinders', value: '4' },
        { label: 'Engine Layout', value: 'First-Engine' },
        { label: 'Engine Configurations', value: 'V Engine (V6, V8)' }
      ],
      video: car.video || '/assets/images/banner/33.mp4',
      mapUrl: car.mapUrl || 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14602.288851207937!2d90.47855065!3d23.798243149999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5m2!1sen!2sbd!4v1663151706353!5m2!1sen!2sbd',
      dealer: car.dealer || {
        name: 'Jonathon Doe',
        role: 'Car Dealer',
        image: '/assets/images/portfolio/author.webp',
        whatsapp: '+14844578513',
        phone: '+18143511443'
      },
      date: car.createdAt ? new Date(car.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    res.locals.page = 'car-details';
    res.render('car-details', {
      title: `${car.title} - AutoVault`,
      car: enrichedCar,
      relatedCars: relatedCars.map(rc => ({
        ...rc,
        imageCount: rc.images.length
      }))
    });
  } catch (error) {
    console.error('Error in renderCarDetails:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load car details'
    });
  }
};

exports.renderContact = (req, res) => {
  res.locals.page = 'contact';
  res.render('contact', {
    title: 'Contact Us - AutoVault'
  });
};

exports.renderService = (req, res) => {
  res.locals.page = 'service';
  res.render('service', {
    title: 'Our Services - AutoVault'
  });
};

exports.renderTeam = (req, res) => {
  res.locals.page = 'team';
  res.render('team', {
    title: 'Our Team - AutoVault'
  });
};

exports.renderFaq = (req, res) => {
  res.locals.page = 'faq';
  res.render('faq', {
    title: 'FAQ - AutoVault'
  });
};

exports.renderBlog = (req, res) => {
  res.locals.page = 'blog';
  res.render('blog', {
    title: 'Blog - AutoVault'
  });
};

exports.renderBlogDetails = (req, res) => {
  res.locals.page = 'blog-details';
  res.render('blog-details', {
    title: 'Blog Details - AutoVault'
  });
};

exports.renderAccount = (req, res) => {
  res.locals.page = 'account';
  res.render('account', {
    title: 'My Account - AutoVault'
  });
};

exports.renderCalculator = (req, res) => {
  res.locals.page = 'calculator';
  res.render('calculator', {
    title: 'Car Loan Calculator - AutoVault'
  });
};

exports.renderCarDealer = (req, res) => {
  res.locals.page = 'car-dealer';
  res.render('car-dealer', {
    title: 'Car Dealer - AutoVault'
  });
};

exports.renderSoldCar = (req, res) => {
  res.locals.page = 'sold-car';
  res.render('sold-car', {
    title: 'Sold Cars - AutoVault'
  });
};

exports.renderPortfolio = (req, res) => {
  res.locals.page = 'portfolio';
  res.render('portfolio', {
    title: 'Portfolio - AutoVault'
  });
};

exports.renderError = (req, res) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'The page you are looking for does not exist.',
    page: 'error'
  });
};
