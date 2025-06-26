const fs = require('fs');
const path = require('path');

class StaticDataHandler {
  constructor() {
    this.dataFilePath = path.join(__dirname, '..', 'data', 'staticData.json');
    this.data = null;
    this.loadData();
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(this.dataFilePath, 'utf-8');
      this.data = JSON.parse(rawData);
      console.log('Static data loaded successfully');
    } catch (error) {
      console.error('Failed to load static data:', error);
      this.data = {};
    }
  }

  getCars() {
    return this.data.cars || [];
  }

  getCarBySlug(slug) {
    if (!this.data.cars) return null;
    return this.data.cars.find(car => car.slug === slug) || null;
  }

  // Add other data retrieval methods as needed
}

module.exports = new StaticDataHandler();
