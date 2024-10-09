const mongoose = require('mongoose');

const settings = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  notification_reminder: {
    prayer_alert: {
      type: Boolean,
      default: true
    },
    dua_day: {
      type: Boolean,
      default: true
    },
    juma_reminder: {
      type: Boolean,
      default: true
    },
    quran_reminder: {
      type: Boolean,
      default: true
    }
  },
  azan_voice: {
    type: String,
    default: 'masjid_al_haram_mecca',
  },
  juma_time: {
    type: String,
  },
  azan_voice_switch: {
    fajar: {
      type: Boolean,
      default: true
    },
    zuhar: {
      type: Boolean,
      default: true
    },
    asr: {
      type: Boolean,
      default: true
    },
    magrib: {
      type: Boolean,
      default: true
    },
    isha: {
      type: Boolean,
      default: true
    },
  },
  namaz_timing: {
    type: Object,
  },
  location: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('Setting', settings);
