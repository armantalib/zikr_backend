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
  bookedDate:{
    type: Date,
  },
  bookedSlot:{
    type: String,
  },
  sessionType:{
    type: String,
  },
  message:{
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('BookSession', bookSessionSchema);
