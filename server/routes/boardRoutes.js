const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // 인증 문지기 소환
const boardController = require('../controllers/boardController');

// [POST] 보드 생성
router.post('/', protect, boardController.createBoard);

// [GET] 보드 목록 조회
router.get('/', protect, boardController.getBoards);

module.exports = router;