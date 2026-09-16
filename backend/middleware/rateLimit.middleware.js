const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter (100 requests per 15 minutes per IP)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errors: null,
  },
});

/**
 * Stricter rate limiter for sensitive authentication & registration routes
 * (15 attempts per 15 minutes per IP)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication requests from this IP, please try again after 15 minutes.',
    errors: null,
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
};
