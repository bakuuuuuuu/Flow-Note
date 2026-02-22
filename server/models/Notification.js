const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // 수신자 및 분류 정보
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { 
    type: String, 
    enum: ['DEADLINE', 'UPDATE', 'SYSTEM'], 
    required: true 
  },
  type: { type: String },

  // 알림 상세 내용
  title: { type: String, required: true },
  content: { type: String },
  linkUrl: { type: String },

  // 읽음 상태 관리
  isRead: { type: Boolean, default: false }
}, {

  // 알림 생성 시각만 자동 기록 (수정 시간 제외)
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Notification', notificationSchema);