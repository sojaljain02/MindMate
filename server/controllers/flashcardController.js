const FlashcardDeck = require('../models/Flashcard');
const pythonService = require('../services/pythonService');

// @desc    Create flashcard deck
// @route   POST /api/flashcards/decks
// @access  Private
const createDeck = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title'
      });
    }

    const deck = await FlashcardDeck.create({
      user: req.user.id,
      title,
      description,
      cards: []
    });

    res.status(201).json({
      success: true,
      data: deck
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all decks for user
// @route   GET /api/flashcards/decks
// @access  Private
const getDecks = async (req, res) => {
  try {
    const decks = await FlashcardDeck.find({ user: req.user.id })
      .sort('-createdAt');

    res.json({
      success: true,
      count: decks.length,
      data: decks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single deck
// @route   GET /api/flashcards/decks/:id
// @access  Private
const getDeck = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    res.json({
      success: true,
      data: deck
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add card to deck
// @route   POST /api/flashcards/decks/:id/cards
// @access  Private
const addCard = async (req, res) => {
  try {
    const { front, back } = req.body;

    if (!front || !back) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both front and back content'
      });
    }

    const deck = await FlashcardDeck.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    const newCard = {
      front,
      back,
      difficulty: 3,
      lastReviewed: null,
      nextReview: new Date(),
      reviewCount: 0
    };

    deck.cards.push(newCard);
    await deck.save();

    // Update user stats
    req.user.stats.totalFlashcards += 1;
    await req.user.save();

    res.json({
      success: true,
      data: newCard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate flashcards from text
// @route   POST /api/flashcards/generate
// @access  Private
const generateFlashcards = async (req, res) => {
  try {
    const { text, deckId, count = 10 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text'
      });
    }

    // Call Python service to generate flashcards
    const flashcardsData = await pythonService.generateFlashcards(text, count);

    // If deckId provided, add to existing deck
    if (deckId) {
      const deck = await FlashcardDeck.findOne({
        _id: deckId,
        user: req.user.id
      });

      if (!deck) {
        return res.status(404).json({
          success: false,
          message: 'Deck not found'
        });
      }

      flashcardsData.cards.forEach(card => {
        deck.cards.push({
          front: card.front,
          back: card.back,
          difficulty: 3,
          lastReviewed: null,
          nextReview: new Date(),
          reviewCount: 0
        });
      });

      await deck.save();

      res.json({
        success: true,
        message: `Added ${flashcardsData.cards.length} cards to deck`,
        data: deck
      });
    } else {
      // Create new deck
      const newDeck = await FlashcardDeck.create({
        user: req.user.id,
        title: flashcardsData.title || 'Generated Flashcards',
        description: `Auto-generated from text`,
        cards: flashcardsData.cards.map(card => ({
          front: card.front,
          back: card.back,
          difficulty: 3,
          lastReviewed: null,
          nextReview: new Date(),
          reviewCount: 0
        }))
      });

      res.json({
        success: true,
        data: newDeck
      });
    }

    // Update user stats
    req.user.stats.totalFlashcards += flashcardsData.cards.length;
    await req.user.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete deck
// @route   DELETE /api/flashcards/decks/:id
// @access  Private
const deleteDeck = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    await deck.deleteOne();

    res.json({
      success: true,
      message: 'Deck deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update card review
// @route   PUT /api/flashcards/decks/:deckId/cards/:cardId/review
// @access  Private
const reviewCard = async (req, res) => {
  try {
    const { difficulty } = req.body;

    const deck = await FlashcardDeck.findOne({
      _id: req.params.deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    const card = deck.cards.id(req.params.cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Update card based on spaced repetition algorithm
    card.lastReviewed = new Date();
    card.reviewCount += 1;
    card.difficulty = difficulty;

    // Calculate next review date based on difficulty
    const daysUntilNext = Math.pow(2, card.reviewCount) * (6 - difficulty);
    card.nextReview = new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000);

    await deck.save();

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createDeck,
  getDecks,
  getDeck,
  addCard,
  generateFlashcards,
  deleteDeck,
  reviewCard
};
