const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

// [POST] 카드 생성
router.post('/', protect, cardController.createCard);

// [PATCH] 카드 수정
router.patch('/:id', protect, cardController.updateCard);

// [DELETE] 카드 삭제
router.delete('/:id', protect, cardController.deleteCard);

module.exports = router;