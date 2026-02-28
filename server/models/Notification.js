const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['DEADLINE', 'UPDATE', 'SYSTEM', 'COMMENT'],
    required: true
  },
  type: {
    type: String,
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  link_url: {
    type: String
  },
  is_read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);