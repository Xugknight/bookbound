const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => res.json({ data: [], total: 0, page: 1, pages: 1 }));

module.exports = router;