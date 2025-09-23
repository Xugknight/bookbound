const express = require('express');
const router = express.Router();
const openLibraryCtrl = require('../controllers/openLibrary');
const { olSearchLimiter } = require('../middleware/limit');

router.get('/search', olSearchLimiter, openLibraryCtrl.search);

module.exports = router;