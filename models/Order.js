const mongoose = require('mongoose');

const planObj = {
  title: String,
  description: String,
  price: String,
  time: Date,
  type: {
    type: String,
    default: 'basic',
    enum: ['basic', 'standard', "premium"]
  }
}

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  title: String,
  images: Array,
  category: String,
  service_type: String,
  description: String,
  keywords: [String],
  requirements: String,
  plans: [planObj],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('Order', orderSchema);
