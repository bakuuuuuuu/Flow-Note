const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['프로젝트', '개발', '업무', '학습', '아이디어', '노트', '일정', '일상', '재정', '운동', '여행', '기타'],
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
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Board', boardSchema);