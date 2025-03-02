const mongoose = require('mongoose');

const userAvailabilitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  teach:[],
  availability:{
    type: Boolean,
    default: false,
  },
  document:{
    type: String,
  },
  country:{
    name: String,
    shortName:String,
  },
  city:{
    name: String,
    country:String,
  },
  hours: [],
  introduction:{
    type: String,
  },
  qualification:[],
  hourlyRate:{
    type: String,
  },
  languages:[],
  eventName:{
    type: String,
  },
  eventDuration:{
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('userAvailability', userAvailabilitySchema);
