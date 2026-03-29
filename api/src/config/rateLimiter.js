const rateLimit = require('express-rate-limit');

const authLimiter = process.env.NODE_ENV === 'test'
        ? (_req, _res, next) => next()
        : rateLimit({
                windowMs: 5 * 60 * 1000,
                max: 5,
                message: { error: 'Too many attempts. Please try again in 5 minutes.' },
                standardHeaders: true,
                legacyHeaders: false,
        });

const generalLimiter = process.env.NODE_ENV === 'test'
        ? (_req, _res, next) => next()
        : rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 100,
                message: { error: 'Too many requests. Please slow down.' },
                standardHeaders: true,
                legacyHeaders: false,
        });

module.exports = { authLimiter, generalLimiter };