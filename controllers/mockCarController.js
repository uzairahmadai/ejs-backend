const cars = [
  {
    make: 'Mercedes-Benz',
    model: 'E-Class',
    slug: 'mercedes-e-class',
    seats: 5,
    color: 'Black',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    price: 45000,
    mileage: 15000,
    imageUrl: '/assets/images/portfolio/01.webp'
  },
  {
    make: 'BMW',
    model: '3 Series',
    slug: 'bmw-3-series',
    seats: 5,
    color: 'White',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    price: 42000,
    mileage: 12000,
    imageUrl: '/assets/images/portfolio/02.webp'
  },
  {
    make: 'Audi',
    model: 'A4',
    slug: 'audi-a4',
    seats: 5,
    color: 'Silver',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    price: 40000,
    mileage: 18000,
    imageUrl: '/assets/images/portfolio/03.webp'
  }
];

exports.getCars = (req, res) => res.json(cars);

exports.getCarBySlug = (req, res) => {
  const car = cars.find(c => c.slug === req.params.slug);
  if (!car) return res.status(404).render('error', { errorMessage: 'Car not found' });
  res.render('portfolio-details', { car, cars }); // Pass all cars for similar cars section
};

exports.getAllCars = (req, res) => {
  res.render('portfolio', { cars, title: 'Car Listing Page' });
};
