const Joi = require('joi');

// 회원가입
const registerSchema = Joi.object({
  email: Joi.string().email().max(100).required().messages({
    'string.email': '유효한 이메일 형식이 아닙니다.',
    'string.max': '이메일이 너무 깁니다.',
    'any.required': '이메일은 필수 항목입니다.'
  }),

  password: Joi.string()
    .min(8).max(30)
    .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required().messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
      'string.max': '비밀번호가 너무 깁니다.',
      'string.pattern.base': '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
      'any.required': '비밀번호는 필수 항목입니다.'
    }),

  nickname: Joi.string()
    .min(2).max(15)
    .pattern(/^[가-힣a-zA-Z0-9_]+$/)
    .required().messages({
      'string.min': '닉네임은 최소 2자 이상이어야 합니다.',
      'string.max': '닉네임은 최대 15자까지 가능합니다.',
      'string.pattern.base': '닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.',
      'any.required': '닉네임은 필수 항목입니다.'
    }),

  name: Joi.string()
    .min(2).max(20)
    .pattern(/^[가-힣a-zA-Z\s]+$/)
    .required().messages({
      'string.min': '이름은 최소 2자 이상이어야 합니다.',
      'string.max': '이름은 최대 20자까지 가능합니다.',
      'string.pattern.base': '이름은 한글 또는 영문만 입력 가능합니다.',
      'any.required': '이름은 필수 항목입니다.'
    }),

  gender: Joi.string().valid('남성', '여성', '선택안함').default('선택안함'),

  birthdate: Joi.string()
  .pattern(/^\d{4}\.\d{2}\.\d{2}$/)
  .required()
  .custom((value, helpers) => {
    const [year, month, day] = value.split('.').map(Number)
    const currentYear = new Date().getFullYear()

    if (year < 1900 || year > currentYear) {
      return helpers.error('any.invalid')
    }
    if (month < 1 || month > 12) {
      return helpers.error('any.invalid')
    }

    const lastDay = new Date(year, month, 0).getDate()
    if (day < 1 || day > lastDay) {
      return helpers.error('any.invalid')
    }

    return value
  })
  .messages({
    'string.pattern.base': '생년월일 형식(YYYY.MM.DD)이 올바르지 않습니다.',
    'any.required': '생년월일은 필수 항목입니다.',
    'any.invalid': '유효하지 않은 날짜입니다.'
  }),

  phone: Joi.string()
    .pattern(/^01[016789]-\d{3,4}-\d{4}$/)
    .required().messages({
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

// 비밀번호 재설정
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8).max(30)
    .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required().messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
      'string.max': '비밀번호가 너무 깁니다.',
      'string.pattern.base': '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
      'any.required': '비밀번호는 필수 항목입니다.'
    }),
});

module.exports = { registerSchema, loginSchema, resetPasswordSchema };