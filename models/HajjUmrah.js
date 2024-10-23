const mongoose = require('mongoose');

const hajjUmrah = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  sub_title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  sub_data: [{
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
  }
],
  image: {
    type: String,

  },
  icon: {
    type: String,

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

module.exports = mongoose.model('HajjUmrah', hajjUmrah);
