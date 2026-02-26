const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

// [POST] 리스트 생성
router.post('/', protect, listController.createList);

// [PATCH] 리스트 수정
router.patch('/:id', protect, listController.updateList);

// [DELETE] 리스트 삭제
router.delete('/:id', protect, listController.deleteList);

module.exports = router;