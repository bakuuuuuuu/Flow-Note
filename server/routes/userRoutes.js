const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// [POST] 회원가입
router.post('/register', userController.registerUser);

// [POST] 로그인
router.post('/login', userController.loginUser);

// 예: 내 프로필 보기 (로그인한 사람만 가능)
router.get('/profile', protect, userController.getUserProfile);

module.exports = router;