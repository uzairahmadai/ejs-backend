require('dotenv').config();

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        url: process.env.SITE_URL || 'http://localhost:3000'
    },

    // Database Configuration
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/autovault',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: process.env.NODE_ENV !== 'production'
        }
    },

    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET || 'default-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // Email Configuration
    email: {
        smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        },
        from: {
            name: process.env.COMPANY_NAME || 'AutoVault',
            email: process.env.COMPANY_EMAIL || 'autovault@gmail.com'
        }
    },

    // External APIs
    apis: {
        googleMaps: {
            key: process.env.GOOGLE_MAPS_API_KEY
        },
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET
        }
    },

    // Company Information
    company: {
        name: process.env.COMPANY_NAME || 'AutoVault',
        address: process.env.COMPANY_ADDRESS || '280 Augusta Avenue, Toronto',
        phone: process.env.COMPANY_PHONE || '+12505550199',
        email: process.env.COMPANY_EMAIL || 'autovault@gmail.com',
        social: {
            facebook: process.env.FACEBOOK_URL || 'https://facebook.com/autovault',
            twitter: process.env.TWITTER_URL || 'https://twitter.com/autovault',
            linkedin: process.env.LINKEDIN_URL || 'https://linkedin.com/company/autovault',
            instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/autovault'
        }
    },

    // Website Configuration
    site: {
        title: process.env.SITE_TITLE || 'AutoVault - Premium Car Dealership',
        description: process.env.SITE_DESCRIPTION || 'Discover and purchase premium vehicles with AutoVault\'s extensive collection and expert service',
        keywords: [
            'car dealership',
            'premium cars',
            'luxury vehicles',
            'car sales',
            'auto dealer',
            'used cars',
            'new cars'
        ]
    },

    // Cache Configuration
    cache: {
        duration: parseInt(process.env.CACHE_DURATION) || 3600
    },

    // Upload Configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf').split(',')
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
        cors: {
            origin: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
            credentials: true
        }
    },

    // Feature Flags
    features: {
        blog: process.env.ENABLE_BLOG === 'true',
        newsletter: process.env.ENABLE_NEWSLETTER === 'true',
        loanCalculator: process.env.ENABLE_LOAN_CALCULATOR === 'true',
        testimonials: process.env.ENABLE_TESTIMONIALS === 'true'
    },

    // Helper function to check if running in production
    isProduction() {
        return this.server.env === 'production';
    },

    // Helper function to check if running in development
    isDevelopment() {
        return this.server.env === 'development';
    },

    // Helper function to check if running in test
    isTest() {
        return this.server.env === 'test';
    }
};

// Freeze the configuration object to prevent modifications
Object.freeze(config);

module.exports = config;
