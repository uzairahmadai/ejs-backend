const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4 // Prefer IPv4
    };

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autovault', mongoOptions);
    console.log('MongoDB Connected');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

module.exports = connectDB;
