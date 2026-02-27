const Activity = require('../models/Activity');

// [특정 보드의 활동 기록 조회]
exports.getBoardActivities = async (req, res) => {
  try {
    const { boardId } = req.params;

    const activities = await Activity.find({ board_id: boardId })
      .populate('user_id', 'name email profile_img')
      .sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: '활동 기록 조회 실패', error: error.message });
  }
};