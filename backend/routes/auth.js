const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');
const { authLimiter } = require('../middleware/limit');

router.post('/signup', authLimiter, authCtrl.signUp);
router.post('/login', authLimiter, authCtrl.logIn);

module.exports = router;