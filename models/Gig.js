const mongoose = require('mongoose');

const planObj = {
  title: String,
  description: String,
  price: String,
  time: String,
  type: {
    type: String,
    default: 'basic',
    enum: ['basic', 'standard', "premium"]
  }
}

const gigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  title: String,
  images: Array,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  service_type: String,
  description: String,
  keywords: [String],
  requirements: String,
  plans: [planObj],
  rating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }], // Reference to likes
});

module.exports = mongoose.model('Gig', gigSchema);
