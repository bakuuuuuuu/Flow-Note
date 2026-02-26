const Board = require('../models/Board');

// [보드 생성]
exports.createBoard = async (req, res) => {
  try {
    const { title, category, deadline, bg_theme } = req.body;

    const newBoard = new Board({
      title,
      category,
      deadline,
      bg_theme: bg_theme || 'default-theme',
      owner_id: req.user._id,
      members: [{ user_id: req.user._id, role: 'admin' }] 
    });

    const savedBoard = await newBoard.save();
    res.status(201).json(savedBoard);
  } catch (error) {
    res.status(500).json({ message: '보드 생성 중 에러 발생', error: error.message });
  }
};