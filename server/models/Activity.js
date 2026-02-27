const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // 보드 특정
  board_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  // 카드 특정
  card_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  // 수정자 특정
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 수정 형태
  action: {
    type: String,
    required: true
  },
  // 구체적인 변경 내용
  details: {
    type: String,
    default: ""
  }
}, {
  // 수정 시각
  timestamps: true 
});

module.exports = mongoose.model('Activity', activitySchema);