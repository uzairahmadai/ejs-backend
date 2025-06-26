const mongoose = require('mongoose');
const config = require('../config/config');

class Database {
    constructor() {
        this.connection = null;
    }

    /**
     * Connect to MongoDB
     * @returns {Promise} Mongoose connection promise
     */
    connect() {
        return new Promise((resolve, reject) => {
            // If already connected, return existing connection
            if (this.connection) {
                return resolve(this.connection);
            }

            // Connection options
            const options = {
                ...config.database.options,
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            };

            // Connect to MongoDB
            mongoose.connect(config.database.uri, options)
                .then(connection => {
                    console.log('Successfully connected to MongoDB.');
                    this.connection = connection;

                    // Handle connection events
                    mongoose.connection.on('error', err => {
                        console.error('MongoDB connection error:', err);
                    });

                    mongoose.connection.on('disconnected', () => {
                        console.warn('MongoDB disconnected. Attempting to reconnect...');
                    });

                    mongoose.connection.on('reconnected', () => {
                        console.log('MongoDB reconnected successfully.');
                    });

                    // Gracefully close connection when process exits
                    process.on('SIGINT', this.closeConnection.bind(this));
                    process.on('SIGTERM', this.closeConnection.bind(this));

                    resolve(connection);
                })
                .catch(err => {
                    console.error('MongoDB connection error:', err);
                    reject(err);
                });
        });
    }

    /**
     * Close MongoDB connection
     * @returns {Promise} Mongoose disconnection promise
     */
    closeConnection() {
        if (!this.connection) {
            return Promise.resolve();
        }

        return mongoose.connection.close()
            .then(() => {
                this.connection = null;
                console.log('MongoDB connection closed.');
            })
            .catch(err => {
                console.error('Error closing MongoDB connection:', err);
                throw err;
            });
    }

    /**
     * Get MongoDB connection status
     * @returns {number} Connection status (0: disconnected, 1: connected, 2: connecting, 3: disconnecting)
     */
    getConnectionState() {
        return mongoose.connection.readyState;
    }

    /**
     * Check if connected to MongoDB
     * @returns {boolean} True if connected
     */
    isConnected() {
        return this.getConnectionState() === 1;
    }

    /**
     * Get Mongoose instance
     * @returns {Object} Mongoose instance
     */
    getMongoose() {
        return mongoose;
    }

    /**
     * Clear all collections (useful for testing)
     * @returns {Promise} Promise that resolves when all collections are cleared
     */
    async clearCollections() {
        if (!this.isConnected()) {
            throw new Error('Not connected to database');
        }

        const collections = mongoose.connection.collections;

        await Promise.all(
            Object.values(collections).map(async (collection) => {
                await collection.deleteMany({});
            })
        );
    }

    /**
     * Create indexes for all models
     * @returns {Promise} Promise that resolves when all indexes are created
     */
    async createIndexes() {
        if (!this.isConnected()) {
            throw new Error('Not connected to database');
        }

        const models = mongoose.models;
        
        await Promise.all(
            Object.values(models).map(async (model) => {
                await model.createIndexes();
            })
        );
    }

    /**
     * Get database statistics
     * @returns {Promise<Object>} Database statistics
     */
    async getStats() {
        if (!this.isConnected()) {
            throw new Error('Not connected to database');
        }

        const stats = await mongoose.connection.db.stats();
        const collections = await mongoose.connection.db.listCollections().toArray();

        return {
            ...stats,
            collections: collections.map(col => col.name),
            connectionState: this.getConnectionState(),
            models: Object.keys(mongoose.models)
        };
    }
}

// Export singleton instance
module.exports = new Database();
