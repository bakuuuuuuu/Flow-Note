const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  board_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  pos: {
    type: Number,
    default: 65535
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('List', ListSchema);