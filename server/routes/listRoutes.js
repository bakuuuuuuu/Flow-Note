const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

// [POST] 리스트 생성
router.post('/', protect, listController.createList);

module.exports = router;