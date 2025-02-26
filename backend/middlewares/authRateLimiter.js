const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 5,
    message: {message: 'Too many login attempts. Please try again in 15 minutes.'}
});

module.exports = {
    authRateLimiter
};