const rateLimit = require('express-rate-limit');
const createError = require('http-errors');
const config = require('../config/development');

const defaultOptions = {
  max: 5,
  windowMs: 15 * 60 * 1000,
  statusCode: 429,
  message: 'Too many requests from this IP, please try again later.'
};

module.exports.createRateLimiter = (rateLimitOptions) => {
  if (!config.rateLimit.enabled) return (req, res, next) => next();

  const options = { ...defaultOptions, ...rateLimitOptions };
  return rateLimit({
    ...options,
    handler: (req, res, next) => {
      throw createError(options.statusCode, options.message);
    }
  });
};
