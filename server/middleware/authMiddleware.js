const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 헤더에 토큰이 있는지 확인 (Bearer 토큰 형식)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 헤더에서 토큰만 추출 ("Bearer <token>" -> "<token>")
      token = req.headers.authorization.split(' ')[1];

      // 토큰 해독 및 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 해독된 ID로 유저를 찾아서 req.user에 담기 (비밀번호는 제외)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // 다음 단계(컨트롤러)로 통과!
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '토큰이 없어 접근이 거부되었습니다.' });
  }
};

module.exports = { protect };