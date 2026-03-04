const Joi = require('joi');

const searchSchema = Joi.object({
  keyword: Joi.string().min(1).max(50).trim().required().messages({
    'string.empty': '검색어를 입력해주세요.',
    'string.max': '검색어는 50자 이내로 입력해주세요.',
    'any.required': '검색어는 필수입니다.'
  })
});

module.exports = { searchSchema };