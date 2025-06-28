const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  originalText: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  length: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium'
  },
  wordCount: {
    original: { type: Number },
    summary: { type: Number }
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
summarySchema.index({ title: 'text', summary: 'text', tags: 'text' });

module.exports = mongoose.model('Summary', summarySchema);
