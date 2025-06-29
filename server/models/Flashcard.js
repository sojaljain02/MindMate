const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  lastReviewed: Date,
  nextReview: Date,
  reviewCount: {
    type: Number,
    default: 0
  }
});

const flashcardDeckSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  cards: {
    type: [cardSchema],
    default: []
  },
  tags: [{
    type: String,
    trim: true
  }],
  studySessions: [{
    date: { type: Date, default: Date.now },
    cardsStudied: Number,
    duration: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastStudied: Date
});

// Make sure the model is exported correctly
module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);
