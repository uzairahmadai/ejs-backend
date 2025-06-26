/**
 * Custom error classes for the application
 */

class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
        this.errors = [];
    }

    addError(field, message) {
        this.errors.push({ field, message });
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500);
        this.name = 'DatabaseError';
    }
}

class FileUploadError extends AppError {
    constructor(message = 'File upload failed') {
        super(message, 400);
        this.name = 'FileUploadError';
    }
}

class PaymentError extends AppError {
    constructor(message = 'Payment processing failed') {
        super(message, 402);
        this.name = 'PaymentError';
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
        this.name = 'RateLimitError';
    }
}

class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(message, 503);
        this.name = 'ServiceUnavailableError';
    }
}

/**
 * Error handler factory
 */
class ErrorHandler {
    /**
     * Handle operational errors
     * @param {Error} err - Error object
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static handleOperationalError(err, req, res) {
        // Log error
        console.error('Operational error:', err);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // API error response
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                errors: err.errors || undefined
            });
        }

        // Web error response
        return res.status(err.statusCode).render('error', {
            title: `Error ${err.statusCode}`,
            message: err.message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }

    /**
     * Handle programming or unknown errors
     * @param {Error} err - Error object
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static handleCriticalError(err, req, res) {
        // Log error
        console.error('Critical error:', err);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // API error response
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong'
            });
        }

        // Web error response
        return res.status(500).render('error', {
            title: 'Error 500',
            message: 'Something went wrong',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }

    /**
     * Global error handler middleware
     * @param {Error} err - Error object
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static globalHandler(err, req, res, next) {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';

        if (err.isOperational) {
            return ErrorHandler.handleOperationalError(err, req, res);
        }
        return ErrorHandler.handleCriticalError(err, req, res);
    }

    /**
     * Async error handler wrapper
     * @param {Function} fn - Async function to wrap
     * @returns {Function} Wrapped function
     */
    static catchAsync(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    FileUploadError,
    PaymentError,
    RateLimitError,
    ServiceUnavailableError,
    ErrorHandler
};
