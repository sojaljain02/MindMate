const FlashcardDeck = require('../models/Flashcard');
const pythonService = require('../services/pythonService');

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


module.exports = {
  createDeck,
  getDecks,
  getDeck
};
