const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  training: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newTrainings',
  }
});

module.exports = mongoose.model('favorite', favoriteSchema);
