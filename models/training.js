const mongoose = require('mongoose');

const classesObj = {
  FirstLevel: [{
    Data: Array,
    Location: String,
    Name: String,
    SecondLevel: [{
      Data: Array,
      Location: String,
      Name: String,
    }],
  }],
}
const moreInformationsObj = {
  Admission: Array,
  ApplyURL: String,
  Capacity: Number,
  Comment: String,
  Duration: Number,
  Fees: String,
  TrainingAddress: String,
  TrainingURL: String,
}
const opinionsObj = {
  Average: String,
  Opinions: Array,
  RatingsTotals: Array,
}

const trainingSchema = new mongoose.Schema({
  TrainingName: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  SchoolName: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  SchoolAddress: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  Email: {
    type: String,
    required: true,
    minlength: 0,
    maxlength: 1024,
  },
  County: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  Type: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  LogoURL: String,
  MoreInformations: moreInformationsObj,
  Classes: classesObj,
  DataType: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  Origin: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  Bio: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  Opinions: opinionsObj,
  City: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  Modality: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  Domain: {
    type: String,
    minlength: 0,
    maxlength: 1024,
  },
  newlyCreated: Boolean
});


const Training = mongoose.model('newTrainings', trainingSchema);


exports.Training = Training;