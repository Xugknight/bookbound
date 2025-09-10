const express = require('express');
const router = express.Router();
const openLibraryCtrl = require('../controllers/openLibrary');

router.get('/search', openLibraryCtrl.search);

module.exports = router;