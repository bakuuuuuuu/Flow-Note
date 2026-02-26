const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

// [POST] 카드 생성
router.post('/', protect, cardController.createCard);

module.exports = router;