const config = require('../config/config');

class ResponseHandler {
    /**
     * Send success response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     * @param {*} data - Response data
     * @param {number} statusCode - HTTP status code
     */
    static success(res, message, data = null, statusCode = 200) {
        const response = {
            success: true,
            message,
            timestamp: new Date().toISOString()
        };

        if (data !== null) {
            response.data = data;
        }

        res.status(statusCode).json(response);
    }

    /**
     * Send error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {Array} errors - Array of validation errors
     */
    static error(res, message, statusCode = 400, errors = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (errors) {
            response.errors = errors;
        }

        // Include stack trace in development
        if (config.isDevelopment() && res.locals.error) {
            response.stack = res.locals.error.stack;
        }

        res.status(statusCode).json(response);
    }

    /**
     * Send paginated response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     * @param {Array} data - Array of items
     * @param {Object} pagination - Pagination details
     * @param {number} statusCode - HTTP status code
     */
    static paginated(res, message, data, pagination, statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            pagination: {
                total: pagination.total,
                page: pagination.currentPage,
                totalPages: pagination.totalPages,
                limit: pagination.limit,
                hasNext: pagination.hasNext,
                hasPrev: pagination.hasPrev
            },
            timestamp: new Date().toISOString()
        };

        res.status(statusCode).json(response);
    }

    /**
     * Send created response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     * @param {*} data - Created resource data
     */
    static created(res, message, data) {
        ResponseHandler.success(res, message, data, 201);
    }

    /**
     * Send no content response
     * @param {Object} res - Express response object
     */
    static noContent(res) {
        res.status(204).end();
    }

    /**
     * Send unauthorized response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static unauthorized(res, message = 'Unauthorized') {
        ResponseHandler.error(res, message, 401);
    }

    /**
     * Send forbidden response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static forbidden(res, message = 'Forbidden') {
        ResponseHandler.error(res, message, 403);
    }

    /**
     * Send not found response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static notFound(res, message = 'Resource not found') {
        ResponseHandler.error(res, message, 404);
    }

    /**
     * Send validation error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {Array} errors - Validation errors
     */
    static validationError(res, message = 'Validation failed', errors) {
        ResponseHandler.error(res, message, 422, errors);
    }

    /**
     * Send server error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static serverError(res, message = 'Internal server error') {
        ResponseHandler.error(res, message, 500);
    }

    /**
     * Send service unavailable response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static serviceUnavailable(res, message = 'Service temporarily unavailable') {
        ResponseHandler.error(res, message, 503);
    }

    /**
     * Send file response
     * @param {Object} res - Express response object
     * @param {Buffer|Stream} file - File to send
     * @param {string} filename - Name of file
     * @param {string} mimetype - MIME type of file
     */
    static file(res, file, filename, mimetype) {
        res.set({
            'Content-Type': mimetype,
            'Content-Disposition': `attachment; filename="${filename}"`
        });
        res.send(file);
    }

    /**
     * Send stream response
     * @param {Object} res - Express response object
     * @param {Stream} stream - Stream to pipe
     * @param {string} filename - Name of file
     * @param {string} mimetype - MIME type of file
     */
    static stream(res, stream, filename, mimetype) {
        res.set({
            'Content-Type': mimetype,
            'Content-Disposition': `attachment; filename="${filename}"`
        });
        stream.pipe(res);
    }

    /**
     * Send redirect response
     * @param {Object} res - Express response object
     * @param {string} url - URL to redirect to
     * @param {number} statusCode - HTTP status code
     */
    static redirect(res, url, statusCode = 302) {
        res.redirect(statusCode, url);
    }

    /**
     * Send JSON response with specific status code
     * @param {Object} res - Express response object
     * @param {number} statusCode - HTTP status code
     * @param {*} data - Response data
     */
    static status(res, statusCode, data) {
        res.status(statusCode).json(data);
    }
}

module.exports = ResponseHandler;
