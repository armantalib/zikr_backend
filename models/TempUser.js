const mongoose = require('mongoose');

const tempVerificationSchema = new mongoose.Schema({
  phone: String,
  code: String,
});

const TempVerification = mongoose.model('TempVerification', tempVerificationSchema);

exports.TempUser = TempVerification;
