const mongoose = require('mongoose');

const userPrayerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  namaz_name:{
    type: String,
    required: true,
  },

  status:{
    type: String,
    default: 'yes',
    enum: ['yes', 'no', "unknown"]
  },
  status_text:{
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('UsersPrayers', userPrayerSchema);
