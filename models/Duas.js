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

module.exports = mongoose.model('Dua', duaScheme);
