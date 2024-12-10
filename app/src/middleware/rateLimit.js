const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// Create a limiter with Redis store
const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
const apiLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later.'
);

// Stricter limit for profile updates
const profileUpdateLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 profile updates per hour
  'Too many profile updates, please try again later.'
);

// Authentication rate limit
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later.'
);

module.exports = {
  apiLimiter,
  profileUpdateLimiter,
  authLimiter
};
