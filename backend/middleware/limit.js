const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

function friendlyHandler(req, res, _next, options) {
  const secs = Math.ceil((options.windowMs || 60_000) / 1000);
  res.set('Retry-After', String(secs));
  res.status(options.statusCode || 429).json(
    (typeof options.message === 'object' && options.message) ||
    { message: options.message || 'Too many requests. Please try again later.' }
  );
}

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Too many attempts. Try again shortly.' },
  handler: friendlyHandler,
});

const olSearchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req, res) => ipKeyGenerator(req, res), // <-- FIX
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Search rate limit hit. Please wait a moment.' },
  handler: friendlyHandler,
});

const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  keyGenerator: (req, res) =>
    req.user?._id?.toString() || ipKeyGenerator(req, res),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Too many changes in a short time. Please slow down.' },
  handler: friendlyHandler,
});

module.exports = { authLimiter, olSearchLimiter, writeLimiter };