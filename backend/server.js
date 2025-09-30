const path = require('path');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

require('dotenv').config();
require('./db');

const csp = helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "img-src": ["'self'", "data:", "https://covers.openlibrary.org"],
    "style-src": ["'self'", "https:", "'unsafe-inline'"],
    "font-src": ["'self'", "https:", "data:"],
    "script-src": ["'self'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": [],
  }
});

app.set('trust proxy', 1);
app.use(logger('dev'));
app.use(express.json());
app.use(csp);
app.use(helmet({
  referrerPolicy: { policy: "no-referrer" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false,
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
};

app.use(express.static(path.join(__dirname, '../frontend/dist')));

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
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The express app is listening on ${port}`);
});