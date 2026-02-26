const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // 인증 문지기 소환
const boardController = require('../controllers/boardController');

// [POST] 로그인한 사용자 보드 생성
router.post('/', protect, boardController.createBoard);

module.exports = router;