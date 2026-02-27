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
    enum: ['신규 프로젝트', '운영', '기획', '런칭', '자기계발', '기타'],
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

  // 소유자 정보
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 협업 멤버 (추후 확장을 위함)
  members: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' }
    }
  ]
}, {
  timestamps: true 
});

module.exports = mongoose.model('Board', boardSchema);