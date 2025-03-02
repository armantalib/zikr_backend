const mongoose = require('mongoose');

const bookSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  to_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  bookedDate: {
    type: Date,
  },
  bookedSlot: {
    type: String,
  },
  sessionType: {
    type: String,
  },
  message: {
    type: String,
  },
  amount: {
    type: Number,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'started', "completed","cancelled"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('BookSession', bookSessionSchema);
