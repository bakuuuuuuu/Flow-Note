const Joi = require('joi');

const boardSchema = Joi.object({
  title: Joi.string().min(1).max(50).trim().required().messages({
    'string.empty': '보드 제목은 필수입니다.',
    'any.required': '보드 제목은 필수 항목입니다.'
  }),
  category: Joi.string()
    .valid('프로젝트', '개발', '업무', '학습', '아이디어', '노트', '일정', '일상', '재정', '운동', '여행', '기타')
    .default('기타'),
  deadline: Joi.date().iso().allow(null, ''),
  bg_theme: Joi.string().default('default-theme'),
  is_starred: Joi.boolean().default(false),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      role: Joi.string().valid('admin', 'editor', 'viewer').default('viewer')
    })
  ).allow(null)
})

const updateBoardSchema = Joi.object({
  title: Joi.string().min(1).max(50).trim().messages({
    'string.empty': '보드 제목은 필수입니다.',
  }),
  category: Joi.string()
    .valid('프로젝트', '개발', '업무', '학습', '아이디어', '노트', '일정', '일상', '재정', '운동', '여행', '기타'),
  deadline: Joi.date().iso().allow(null, ''),
  bg_theme: Joi.string(),
  is_starred: Joi.boolean(),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      role: Joi.string().valid('admin', 'editor', 'viewer').default('viewer')
    })
  ).allow(null)
})

module.exports = { boardSchema, updateBoardSchema }