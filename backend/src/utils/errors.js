/**
 * Custom Error Classes for Better Error Handling
 */

export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500, false);
        this.originalError = originalError;
    }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: error.message,
            stack: err.stack,
            statusCode: error.statusCode,
        });
    }

    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
        error = new ConflictError('Duplicate entry. Resource already exists.');
    }

    // MySQL foreign key constraint error
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        error = new ValidationError('Referenced resource does not exist');
    }

    // MySQL bad field error
    if (err.code === 'ER_BAD_FIELD_ERROR') {
        error = new DatabaseError('Database schema error', err);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AuthenticationError('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = new AuthenticationError('Token expired');
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = new ValidationError('File size too large');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = new ValidationError('Unexpected file field');
    }

    // Send error response
    const response = {
        status: error.status || 'error',
        message: error.message || 'Internal server error',
    };

    // Include additional error details in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        if (error.errors) response.errors = error.errors;
    }

    // Include validation errors if present
    if (error.errors && process.env.NODE_ENV === 'production') {
        response.errors = error.errors;
    }

    res.status(error.statusCode).json(response);
};

/**
 * Handle 404 routes
 */
export const notFoundHandler = (req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl}`));
};


