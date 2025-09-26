const path = require('path');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

require('dotenv').config();
require('./db');

app.set('trust proxy', 1);
app.use(logger('dev'));
app.use(express.json());
app.use(helmet());

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