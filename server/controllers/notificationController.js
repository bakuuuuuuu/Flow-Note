const Notification = require('../models/Notification');

// [내 알림 목록 조회]
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: '알림 조회 실패', error: error.message });
  }
};

// [알림 읽음 표시]
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: '알림을 찾을 수 없습니다.' });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: '알림 상태 업데이트 실패', error: error.message });
  }
};

// [알림 개별 삭제]
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user_id: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: '삭제할 알림이 없거나 권한이 없습니다.' });
    }

    res.status(200).json({ message: '알림이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '알림 삭제 실패', error: error.message });
  }
};