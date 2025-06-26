const config = require('../config/config');

// Collection of middleware functions
module.exports = {
    // Error handling middleware
    errorHandler: (err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        const message = err.message || 'Internal Server Error';

        // Log error in development
        if (config.isDevelopment()) {
            console.error(err.stack);
        }

        res.status(statusCode).render('error', {
            title: `Error ${statusCode}`,
            message,
            error: config.isDevelopment() ? err : {}
        });
    },

    // 404 Not Found middleware
    notFound: (req, res, next) => {
        const err = new Error('Not Found');
        err.statusCode = 404;
        next(err);
    },

    // Security headers middleware
    securityHeaders: (req, res, next) => {
        // HSTS
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        
        // XSS Protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Referrer Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Frame Options
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        
        next();
    },

    // Rate limiting middleware
    rateLimit: require('express-rate-limit')({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        message: 'Too many requests from this IP, please try again later.'
    }),

    // Authentication middleware
    authenticate: (req, res, next) => {
        if (req.session && req.session.user) {
            next();
        } else {
            res.redirect('/login');
        }
    },

    // Admin authentication middleware
    authenticateAdmin: (req, res, next) => {
        if (req.session && req.session.user && req.session.user.isAdmin) {
            next();
        } else {
            res.status(403).render('error', {
                title: 'Access Denied',
                message: 'You do not have permission to access this resource.'
            });
        }
    },

    // Request logger middleware
    requestLogger: (req, res, next) => {
        if (config.isDevelopment()) {
            console.log(`${req.method} ${req.url}`);
        }
        next();
    },

    // Response time middleware
    responseTime: (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            if (config.isDevelopment()) {
                console.log(`${req.method} ${req.url} - ${duration}ms`);
            }
        });
        next();
    },

    // CORS middleware
    cors: (req, res, next) => {
        const origin = req.headers.origin;
        if (config.security.cors.origin.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        next();
    },

    // Cache control middleware
    cacheControl: (req, res, next) => {
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', `public, max-age=${config.cache.duration}`);
        } else {
            res.setHeader('Cache-Control', 'no-store');
        }
        next();
    },

    // File upload middleware
    validateFileUpload: (req, res, next) => {
        if (!req.files) return next();

        const files = Array.isArray(req.files) ? req.files : [req.files];
        
        for (const file of files) {
            // Check file size
            if (file.size > config.upload.maxFileSize) {
                return next(new Error('File size exceeds limit'));
            }

            // Check file type
            const ext = file.originalname.split('.').pop().toLowerCase();
            if (!config.upload.allowedTypes.includes(ext)) {
                return next(new Error('File type not allowed'));
            }
        }
        next();
    },

    // View variables middleware
    viewVariables: (req, res, next) => {
        res.locals.user = req.session?.user || null;
        res.locals.config = {
            company: config.company,
            site: config.site,
            features: config.features
        };
        res.locals.currentPath = req.path;
        next();
    },

    // Maintenance mode middleware
    maintenanceMode: (req, res, next) => {
        if (process.env.MAINTENANCE_MODE === 'true') {
            res.status(503).render('maintenance', {
                title: 'Site Maintenance',
                message: 'We are currently performing maintenance. Please check back soon.'
            });
        } else {
            next();
        }
    }
};
