const express = require('express');
const router = express.Router();
const {
  createDeck,
  getDecks,
  getDeck,
  addCard,
  generateFlashcards,
  deleteDeck,
  reviewCard
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.route('/decks')
  .get(getDecks)
  .post(createDeck);

router.route('/decks/:id')
  .get(getDeck)
  .delete(deleteDeck);

router.post('/decks/:id/cards', addCard);
router.put('/decks/:deckId/cards/:cardId/review', reviewCard);
router.post('/generate', generateFlashcards);

module.exports = router;
