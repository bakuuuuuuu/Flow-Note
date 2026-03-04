const Joi = require('joi');

// 회원가입
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '유효한 이메일 형식이 아닙니다.',
    'any.required': '이메일은 필수 항목입니다.'
  }),
  password: Joi.string().min(6).max(30).required().messages({
    'string.min': '비밀번호는 최소 6자 이상이어야 합니다.',
    'string.max': '비밀번호가 너무 깁니다.',
    'any.required': '비밀번호는 필수 항목입니다.'
  }),
  nickname: Joi.string().min(2).max(20).required().messages({
    'string.min': '닉네임은 최소 2자 이상이어야 합니다.',
    'any.required': '닉네임은 필수 항목입니다.'
  }),
  name: Joi.string().required().messages({
    'any.required': '이름은 필수 항목입니다.'
  }),
  gender: Joi.string().valid('남성', '여성', '선택안함').default('선택안함'),
  
  birthdate: Joi.date().required().messages({
    'date.base': '유효한 날짜 형식이 아닙니다.',
    'any.required': '생년월일은 필수 항목입니다.'
  }),
  
  phone: Joi.string().regex(/^\d{2,3}-\d{3,4}-\d{4}$/).required().messages({
    'string.pattern.base': '전화번호 형식(010-0000-0000)이 올바르지 않습니다.',
    'any.required': '전화번호는 필수 항목입니다.'
  }),
  
  status_message: Joi.string().max(50).allow('', null)
});

// 로그인
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '이메일 형식이 올바르지 않습니다.',
    'any.required': '이메일을 입력해주세요.'
  }),
  password: Joi.string().required().messages({
    'any.required': '비밀번호를 입력해주세요.'
  })
});

module.exports = { registerSchema, loginSchema };