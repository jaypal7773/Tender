const rateLimit = require('express-rate-limit');

// Less strict rate limiter for API
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Allow 100 requests per minute
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.'
    }
});

module.exports = { apiLimiter, authLimiter };