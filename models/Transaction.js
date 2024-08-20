const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  order:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  },
  bankdetail:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankDetail',
  },
  balance:{
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: 'withdraw',
    enum: ['withdraw',"deposit","fee"]
  },
  status:{
    type: String,
    default: 'completed',
    enum: ['pending',"completed"]
  },
  receipt:{
    type: String,
    default:""
  },
  description:{
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
