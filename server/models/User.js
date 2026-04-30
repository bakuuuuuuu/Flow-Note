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
    required: false,
    default: null
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
    required: false,
    default: null
  },
  phone: {
    type: String,
    required: false,
    default: null
  },

  // 프로필 및 개인 설정
  profile_img: {
    type: String,
    default: "default_profile.png" 
  },
  status_message: {
    type: String,
    maxlength: 50,
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

  agreed_at: {
    type: Date,
    default: null
  },
  
  provider: {
    type: String,
    enum: ['local', 'google', 'kakao', 'naver'],
    default: 'local'
  },
  social_id: {
    type: String,
    default: null
  },
  is_profile_complete: {
    type: Boolean,
    default: true
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);