const mongoose = require('mongoose');

const bankDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  acc_title:{
    type: String,
    required: true,
  },
  bank_name:{
    type: String,
    required: true,
  },
  number:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('BankDetail', bankDetailSchema);
