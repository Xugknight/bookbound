const path = require('path');
const express = require('express');
const logger = require('morgan');
const app = express();

require('dotenv').config();
require('./db');

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/books', require('./routes/books'));
app.use('/api/ol', require('./routes/openLibrary'));

app.get('/*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`The express app is listening on ${port}`);
});