const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  // 사용자 및 검색어 정보
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  keyword: { type: String, required: true, trim: true }
}, {

  // 검색 일시만 자동 기록 (수정 시간 제외)
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);