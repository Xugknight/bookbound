const rateLimit = require('express-rate-limit');

function ipKey(req) {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}
function userOrIpKey(req) {
  return req.user?._id?.toString() || ipKey(req);
}

function friendlyHandler(req, res, _next, options) {
  const secs = Math.ceil((options.windowMs || 60_000) / 1000);
  res.set('Retry-After', String(secs));
  res
    .status(options.statusCode || 429)
    .json(
      (typeof options.message === 'object' && options.message) ||
      { message: options.message || 'Too many requests. Please try again later.' }
    );
}

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: ipKey,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Too many attempts. Try again shortly.' },
  handler: friendlyHandler,
});

const olSearchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: ipKey,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Too many searches. Please slow down.' },
  handler: friendlyHandler,
});

const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
  message: { message: 'Too many changes in a short time. Please slow down.' },
  handler: friendlyHandler,
});

module.exports = { authLimiter, olSearchLimiter, writeLimiter };