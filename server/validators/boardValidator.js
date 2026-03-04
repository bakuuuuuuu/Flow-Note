const Joi = require('joi');

const boardSchema = Joi.object({
  title: Joi.string().min(1).max(50).trim().required().messages({
    'string.empty': '보드 제목은 필수입니다.',
    'any.required': '보드 제목은 필수 항목입니다.'
  }),
  category: Joi.string()
    .valid('신규 프로젝트', '운영', '기획', '런칭', '자기계발', '기타')
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
});

module.exports = { boardSchema };