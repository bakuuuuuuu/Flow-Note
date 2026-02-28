const Notification = require('../models/Notification');

const createNotification = async ({ user_id, category, type, title, content, link_url }) => {
  try {
    await Notification.create({
      user_id,
      category,
      type,
      title,
      content,
      link_url
    });
  } catch (error) {
    console.error("❌ 알림 생성 실패:", error);
  }
};

module.exports = createNotification;