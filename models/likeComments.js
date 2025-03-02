const mongoose = require('mongoose');

const likeCommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true,
  },
});

module.exports = mongoose.model('LikeComments', likeCommentSchema);
