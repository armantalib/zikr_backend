const mongoose = require('mongoose');

const duaScheme = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  arabic: {
    type: String,
    required: true,
  },
  english: {
    type: String,
    required: true,
  },
  verse_id: {
    type: String,
    required: true,
  },
  verse_key: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('Favorite', duaScheme);
