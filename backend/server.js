const path = require('path');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();
require('./db');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  referrerPolicy: { policy: "no-referrer" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false,
}));

app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "img-src": ["'self'", "data:", "https://covers.openlibrary.org", "https://*.archive.org", "https://archive.org"],
    "style-src": ["'self'", "https:", "'unsafe-inline'"],
    "font-src": ["'self'", "https:", "data:"],
    "script-src": ["'self'", "https://static.cloudflareinsights.com"],
    "connect-src": ["'self'", "https://cloudflareinsights.com"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": [],
  }
}));

app.set('trust proxy', 1);
app.use(logger('dev'));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}

const distDir = path.join(__dirname, '../frontend/dist');

app.use('/assets', express.static(path.join(distDir, 'assets'), {
  maxAge: '1y',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));

app.use('/images', express.static(path.join(distDir, 'images'), {
  maxAge: '30d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  },
}));

app.use(express.static(distDir, {
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

app.use((req, res, next) => {
  res.set(
    'Access-Control-Expose-Headers',
    'Retry-After, RateLimit, RateLimit-Remaining, RateLimit-Policy'
  );
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use(require('./middleware/checkToken'));
app.use('/api/books', require('./routes/books'));
app.use('/api/ol', require('./routes/openLibrary'));

app.get('/*splat', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The express app is listening on ${port}`);
});