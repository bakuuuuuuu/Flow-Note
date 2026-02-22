const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  // 위치 정보
  board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  list_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  // 기본 내용
  title: { type: String, required: true, trim: true },
  content: { type: String, default: "" },

  // 일정 및 알림
  due_date: { type: Date },
  remind_before: { type: Number, default: 0 },
  
  // 정렬 및 상태
  pos: { type: Number, required: true, default: 0 }, 
  is_archived: { type: Boolean, default: false }, 

  // 관계 및 라벨
  assignee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  labels: [
    {
      color: { type: String }, 
      text: { type: String }   
    }
  ],

  // 하위 항목들 (배열 형태)
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
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  comments: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  logsArray: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      action: { type: String, required: true }, 
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true 
});

module.exports = mongoose.model('Card', cardSchema);