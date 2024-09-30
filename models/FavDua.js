const mongoose = require('mongoose');

const duaScheme = new mongoose.Schema({
  dua: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dua',
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

module.exports = mongoose.model('FavDua', duaScheme);
