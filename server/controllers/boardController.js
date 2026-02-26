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

// 내 보드 목록 조회
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner_id: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ 
      message: '보드 목록을 가져오는데 실패했습니다.', 
      error: error.message 
    });
  }
};