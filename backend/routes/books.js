const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');
const { writeLimiter } = require('../middleware/limit');

router.use(ensureLoggedIn);

router.get('/', booksCtrl.index);
router.post('/', writeLimiter, booksCtrl.create);
router.delete('/:id', writeLimiter, booksCtrl.delete);
router.patch('/:id/status', writeLimiter, booksCtrl.update);
router.patch('/:id/notes', writeLimiter, booksCtrl.updateNotes);
router.patch('/:id/rating', writeLimiter, booksCtrl.updateRating);

module.exports = router;