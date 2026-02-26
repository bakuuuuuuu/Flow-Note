const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  // 보드 기본 정보
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['신규 프로젝트', '운영', '기획', '런칭', '기타'],
    default: '기타'
  },
  is_starred: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
  },
  bg_theme: { 
    type: String, 
    default: 'default-theme' 
  },

  // 소유자 및 협업 멤버
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' }
    }
  ],

  // 보드 내 리스트 구조
  lists: [
    {
      title: { type: String, required: true },
      pos: { type: Number, default: 0 }
    }
  ]
}, {
  // 생성 및 수정 시간 자동 기록
  timestamps: true 
});

module.exports = mongoose.model('Board', boardSchema);