const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  proofwork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProofWork',
  },
  cover_letter: {
    type: String,
  },
  resume: {
    type: String,
  },
  description: {
    type: String,
  },
  bid_price: {
    type: Number,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected']
  },
  seen: { 
    type: Boolean,
    default: false,
  },
  view: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('Application', applicationSchema);
