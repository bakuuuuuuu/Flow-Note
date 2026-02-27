const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// [GET] 특정 보드의 활동 기록 조회
router.get('/:boardId', protect, activityController.getBoardActivities);

module.exports = router;