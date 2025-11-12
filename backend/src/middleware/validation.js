import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware to handle validation errors from express-validator
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value,
        }));

        throw new ValidationError('Validation failed', formattedErrors);
    }

    next();
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export const sanitizeInput = (req, res, next) => {
    // Sanitize body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query params
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    // Sanitize params
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
}

/**
 * Sanitize a string value
 */
function sanitizeString(value) {
    if (typeof value !== 'string') {
        return value;
    }

    // Remove potential XSS vectors
    return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
        throw new ValidationError('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
        throw new ValidationError('Limit must be between 1 and 100');
    }

    req.pagination = {
        page,
        limit,
        offset: (page - 1) * limit,
    };

    next();
};

/**
 * Validate date range parameters
 */
export const validateDateRange = (req, res, next) => {
    const { from, to } = req.query;

    if (from && isNaN(Date.parse(from))) {
        throw new ValidationError('Invalid "from" date format');
    }

    if (to && isNaN(Date.parse(to))) {
        throw new ValidationError('Invalid "to" date format');
    }

    if (from && to && new Date(from) > new Date(to)) {
        throw new ValidationError('"from" date must be before "to" date');
    }

    next();
};

/**
 * Validate ID parameter
 */
export const validateId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = parseInt(req.params[paramName]);

        if (isNaN(id) || id < 1) {
            throw new ValidationError(`Invalid ${paramName}`);
        }

        req.params[paramName] = id;
        next();
    };
};


