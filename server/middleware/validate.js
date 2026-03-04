const validate = (schema) => (req, res, next) => {
  // 요청 데이터(body)를 스키마와 비교
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ message: errorMessage });
  }

  next();
};

module.exports = validate;