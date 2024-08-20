const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  Type: {
    type: String,
    minlength: 0,
    maxlength: 50,
  },
  Name: {
    type: String,
    minlength: 2,
    maxlength: 250,
  },
  LogoURL: {
    type: String,
    minlength: 2,
    maxlength: 250,
  },
  TrainingsIds: [{
    type: String,
    minlength: 0,
    maxlength: 250,
  }],
  Count: {
    type: Number,
    minlength: 2,
    maxlength: 250,
  },
  rating: {
    type: Number,
    minlength: 0,
    maxlength: 5,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});


const School = mongoose.model('NewSchools', schoolSchema);


exports.School = School;
