const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const listSchema = Joi.object({
  title: Joi.string().min(1).max(50).trim().required().messages({
    'string.empty': '리스트 제목은 필수입니다.',
    'any.required': '리스트 제목은 필수 항목입니다.'
  }),
  board_id: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': '유효하지 않은 board_id 형식입니다.',
    'any.required': '보드 ID는 필수입니다.'
  }),
  pos: Joi.number().default(65535)
});

// 수정 시에는 모든 필드가 필수일 필요가 없으므로 별도 정의하거나 .optional() 사용
const updateListSchema = Joi.object({
  title: Joi.string().min(1).max(50).trim(),
  pos: Joi.number()
});

module.exports = { listSchema, updateListSchema };