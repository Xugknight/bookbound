const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');

router.use(ensureLoggedIn);

router.get('/', booksCtrl.index);
router.post('/', booksCtrl.create);
router.delete('/:id', booksCtrl.delete);
router.patch('/:id/status', booksCtrl.update);
router.patch('/:id/notes', booksCtrl.updateNotes);
router.patch('/:id/rating', booksCtrl.updateRating);

module.exports = router;