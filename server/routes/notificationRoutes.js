const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// [GET] 내 알림 목록
router.get('/', protect, notificationController.getMyNotifications);

// [PATCH] 특정 알림 읽음 처리
router.patch('/:id/read', protect, notificationController.markAsRead);

// [PATCH] 모든 알림 일괄 읽음 처리
router.patch('/read-all', protect, notificationController.markAllAsRead);

// [DELETE] 특정 알림 삭제
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;