const Card = require('../models/Card');
const List = require('../models/List');

// [카드 생성]
exports.createCard = async (req, res) => {
  try {
    const { title, list_id, board_id, content, pos } = req.body;

    if (!title || !list_id || !board_id) {
      return res.status(400).json({ message: '제목, 리스트ID, 보드ID는 필수입니다.' });
    }

    // 리스트 존재 유무 확인
    const listExists = await List.findById(list_id);
    if (!listExists) {
      return res.status(404).json({ message: '카드를 추가할 리스트를 찾을 수 없습니다.' });
    }

    // 카드 객체 생성
    const newCard = new Card({
      title,
      content: content || "",
      list_id,
      board_id,
      owner_id: req.user._id,
      pos: pos || 65535
    });

    const savedCard = await newCard.save();
    
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({ 
      message: '카드 생성 중 에러 발생', 
      error: error.message 
    });
  }
};