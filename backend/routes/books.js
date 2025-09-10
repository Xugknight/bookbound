const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');

// GET /api/books
router.get('/', booksCtrl.index);

// POST /api/books
router.post('/', booksCtrl.create);

module.exports = router;