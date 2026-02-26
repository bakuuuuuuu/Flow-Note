const List = require('../models/List');
const Board = require('../models/Board');

// [리스트 생성]
exports.createList = async (req, res) => {
  try {
    const { title, board_id } = req.body;

    // 해당 보드가 존재하는지, 그리고 내 보드가 맞는지 확인
    const board = await Board.findById(board_id);
    if (!board || board.owner_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: '보드를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 리스트 생성
    const newList = new List({
      title,
      board_id,
    });

    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (error) {
    res.status(500).json({ message: '리스트 생성 실패', error: error.message });
  }
};