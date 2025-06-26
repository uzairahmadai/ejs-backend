const mongoose = require('mongoose');
const slugify = require('slugify');

const carSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    make: {
        type: String,
        required: [true, 'Make is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1900, 'Year must be after 1900'],
        max: [new Date().getFullYear() + 1, `Year can't be in the future`]
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },
    mileage: {
        type: Number,
        required: [true, 'Mileage is required'],
        min: [0, 'Mileage must be positive']
    },
    tag: {
        type: String,
        enum: ['New', 'Used', 'Featured', 'Electric', 'Supercar', 'Sport'],
        default: 'Used'
    },
    images: {
        type: [String],
        required: [true, 'At least one image is required'],
        validate: {
            validator: imgs => imgs.length > 0,
            message: 'At least one image is required'
        }
    },
    transmission: {
        type: String,
        enum: ['Automatic', 'Manual', 'CVT', 'DCT'],
        required: [true, 'Transmission type is required']
    },
    fuelType: {
        type: String,
        enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'],
        required: [true, 'Fuel type is required']
    },
    driveType: {
        type: String,
        enum: ['FWD', 'RWD', 'AWD', '4WD'],
        required: [true, 'Drive type is required']
    },
    color: {
        type: String,
        required: [true, 'Color is required']
    },
    seats: {
        type: Number,
        required: [true, 'Number of seats is required'],
        min: [1, 'Must have at least 1 seat'],
        max: [20, 'Cannot have more than 20 seats']
    },
    features: {
        type: [String],
        required: [true, 'At least one feature is required'],
        validate: {
            validator: f => Array.isArray(f) && f.length > 0,
            message: 'At least one feature is required'
        }
    },
    engine: {
        type: String,
        displacement: String,
        horsepower: String,
        torque: String,
        cylinders: String,
        layout: String,
        configuration: String
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    video: String,
    mapUrl: String,
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Dealer reference is required']
    },
    status: {
        type: String,
        enum: ['Available', 'Sold', 'Pending', 'Reserved'],
        default: 'Available'
    },
    views: {
        type: Number,
        default: 0
    },
    favorites: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate title and slug
carSchema.pre('save', function (next) {
    if (!this.title) {
        this.title = `${this.make} ${this.model} ${this.year}`;
    }
    this.slug = slugify(this.title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true
    });
    this.updatedAt = Date.now();
    next();
});

// Update slug on document update
carSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.make || update.model || update.year) {
        const make = update.make || this._conditions.make;
        const model = update.model || this._conditions.model;
        const year = update.year || this._conditions.year;
        update.title = `${make} ${model} ${year}`;
        update.slug = slugify(update.title, {
            lower: true,
            remove: /[*+~.()'"!:@]/g,
            strict: true
        });
        update.updatedAt = Date.now();
    }
    next();
});

// Static method for filter counts (optimized)
carSchema.statics.getFilterCounts = async function (filter = {}) {
    const results = await Promise.all([
        this.aggregate([{ $match: filter }, { $group: { _id: '$make', count: { $sum: 1 } } }]),
        this.aggregate([{ $match: filter }, { $group: { _id: '$model', count: { $sum: 1 } } }]),
        this.aggregate([{ $match: filter }, { $group: { _id: '$color', count: { $sum: 1 } } }]),
        this.aggregate([{ $match: filter }, { $group: { _id: '$seats', count: { $sum: 1 } } }]),
        this.aggregate([{ $match: filter }, { $group: { _id: '$fuelType', count: { $sum: 1 } } }])
    ]);

    return {
        make: Object.fromEntries(results[0].map(r => [r._id, r.count])),
        model: Object.fromEntries(results[1].map(r => [r._id, r.count])),
        color: Object.fromEntries(results[2].map(r => [r._id, r.count])),
        seats: Object.fromEntries(results[3].map(r => [r._id, r.count])),
        fuelType: Object.fromEntries(results[4].map(r => [r._id, r.count]))
    };
};

// Indexes
carSchema.index({ slug: 1 });
carSchema.index({ make: 1, model: 1 });
carSchema.index({ price: 1 });
carSchema.index({ mileage: 1 });
carSchema.index({ status: 1 });
carSchema.index({ tag: 1 });
carSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Car', carSchema);