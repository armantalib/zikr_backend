const mongoose = require('mongoose');

const offSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  title: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  images: Array,
  position: String,
  comp_name: String,
  job_type: {
    type: String,
    default: 'full-time',
    enum: ['freelance', 'full-time', "part-time", 'fixed']
  },
  location: {
    lat: String,
    lng: String,
    address: String
  },
  description: String,
  requirements: String,
  degree: String,
  experience: String,
  specialization: String,
  price: String,
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'expired']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OfferLike' }], // Reference to likes
  // applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }], // Reference to likes
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }], // Reference to likes
});

module.exports = mongoose.model('Offer', offSchema);
