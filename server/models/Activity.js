const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  board_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  card_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  
  action_type: {
    type: String,
    required: true,
    enum: {
      values: ['CREATE', 'UPDATE', 'DELETE', 'MOVE', 'ATTACHMENT', 'ATTACHMENT_DELETE'],
      message: '{VALUE}는 유효하지 않은 활동 타입입니다.'
    },
    uppercase: true
  }, 
  
  action: {
    type: String,
    required: true
  }, 
  
  details: {
    type: String,
    default: ""
  },
  
  field: {
    type: String
  }, 
  old_value: {
    type: mongoose.Schema.Types.Mixed
  },
  new_value: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Activity', activitySchema);