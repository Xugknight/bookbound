const rateLimit = require('express-rate-limit');

// Shared handler so all 429s look the same and include Retry-After
function friendlyHandler(req, res, _next, options) {
  const secs = Math.ceil((options.windowMs || 60_000) / 1000);
  res.set('Retry-After', String(secs));
  res.status(options.statusCode || 429).json(
    (typeof options.message === 'object' && options.message) ||
    { message: options.message || 'Too many requests. Please try again later.' }
  );
}

// Auth: throttle brute-force
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 20, // 20 attempts/IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Too many attempts. Try again shortly.' },
  handler: friendlyHandler,
});

// Open Library proxy: be polite (per-IP only)
const olSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // 30 searches/IP/min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // explicit: IP only, regardless of logged-in state
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Search rate limit hit. Please wait a moment.' },
  handler: friendlyHandler,
});

// Writes: per user if logged in, else per IP
const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 120, // add/update/delete cap
  keyGenerator: (req) => (req.user?._id?.toString() || req.ip),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Too many changes in a short time. Please slow down.' },
  handler: friendlyHandler,
});

module.exports = { authLimiter, olSearchLimiter, writeLimiter };