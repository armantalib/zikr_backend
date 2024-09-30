const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  to_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  session: {
  type: mongoose.Schema.Types.ObjectId,
    ref: 'session'
  },
  user_type: {
    type: String,
    required: true,
    enum: ['student', 'trainer']
  },
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('Rating', ratingSchema);
