const mongoose = require('mongoose');

const bookSlots = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  slots:[],
  date:{
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('BookSlots', bookSlots);
