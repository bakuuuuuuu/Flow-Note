const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const boardController = require('../controllers/boardController');
const validate = require('../middleware/validate');
const { boardSchema } = require('../validators/boardValidator');

// [POST] 보드 생성
router.post('/', protect, validate(boardSchema), boardController.createBoard);

// [GET] 보드 목록 조회
router.get('/', protect, boardController.getBoards);

// [GET] 특정 보드 상세 정보 조회
router.get('/:id', protect, boardController.getBoardById);

// [PATCH] 보드 정보 수정
router.patch('/:id', protect, validate(boardSchema), boardController.updateBoard);

// [DELETE] 보드 삭제
router.delete('/:id', protect, boardController.deleteBoard);

module.exports = router;