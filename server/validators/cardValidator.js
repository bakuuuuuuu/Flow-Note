const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const cardSchema = Joi.object({
  list_id: Joi.string().regex(objectIdPattern).required(),
  board_id: Joi.string().regex(objectIdPattern).required(),
  title: Joi.string().min(1).max(100).trim().required(),
  
  content: Joi.string().allow('', null),
  due_date: Joi.date().iso().allow(null, ''),
  remind_before: Joi.number().min(0).default(0),
  is_notified: Joi.boolean().default(false),
  status: Joi.string().valid('대기', '진행중', '완료', '보류'),
  priority: Joi.string().valid('긴급', '높음', '보통', '낮음'),
  pos: Joi.number(),
  is_archived: Joi.boolean(),
  labels: Joi.array().items(
    Joi.object({
      color: Joi.string().allow(''),
      text: Joi.string().allow('')
    })
  ).allow(null),
  checklists: Joi.array().items(
    Joi.object({
      _id: Joi.string().regex(objectIdPattern).allow(null),
      text: Joi.string().required(),
      isDone: Joi.boolean().default(false)
    })
  ).allow(null),
  owner_id: Joi.string().regex(objectIdPattern)
});

// 수정용 스키마
const updateCardSchema = cardSchema.fork(
  ['list_id', 'board_id', 'title'], 
  (schema) => schema.optional()
);

module.exports = { cardSchema, updateCardSchema };