const rateLimit = require('express-rate-limit');

// Auth: throttle brute-force
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 20, // 20 attempts/IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Try again shortly.' }
});

// Open Library proxy: be polite
const olSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // 30 searches/IP/min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Search rate limit hit. Please wait a moment.' }
});

// Writes: per user if logged in, else per IP
const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 120, // add/update/delete cap
  keyGenerator: (req) => (req.user?._id?.toString() || req.ip),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many changes in a short time. Please slow down.' }
});

module.exports = { authLimiter, olSearchLimiter, writeLimiter };