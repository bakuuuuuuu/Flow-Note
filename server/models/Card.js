const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  list_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'List',
    required: true 
  },
  board_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Board', 
    required: true 
  },

  // 기본 내용
  title: { type: String, required: true, trim: true },
  content: { type: String, default: "" },

  // 일정 및 알림
  due_date: { type: Date },
  remind_before: { type: Number, default: 0 },
  
  // 정렬 및 상태
  pos: { type: Number, required: true, default: 65535 },
  status: { 
    type: String, 
    enum: ['대기', '진행중', '완료', '보류'], 
    default: '대기' 
  },
  priority: {
    type: String,
    enum: ['긴급', '높음', '보통', '낮음'],
    default: '보통'
  },
  is_archived: { type: Boolean, default: false }, 

  // 관계 및 라벨
  owner_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  // (추후 확장을 위함)
  assignee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  labels: [
    {
      color: { type: String }, 
      text: { type: String }   
    }
  ],

  checklists: [
    {
      text: { type: String, required: true },
      isDone: { type: Boolean, default: false }
    }
  ],
  attachments: [
    {
      fileName: { type: String },
      fileUrl: { type: String },
      fileSize: { type: Number }, 
      fileType: { type: String }, 
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  comments: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]

}, {
  timestamps: true
});

module.exports = mongoose.model('Card', cardSchema);