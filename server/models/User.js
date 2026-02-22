const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 로그인 및 인증 정보
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },

  // 기본 인적 사항
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['남성', '여성', '선택안함'], 
    default: '선택안함'
  },
  birthdate: {
    type: Date,
    required: true
  },
  phone: {
    type: String,
    required: true
  },

  // 프로필 및 개인 설정
  profile_img: {
    type: String,
    default: "" 
  },
  settings: {
    theme: {
      type: String,
      default: "light"
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
}, {

  // 생성 및 수정 시간 자동 기록
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);