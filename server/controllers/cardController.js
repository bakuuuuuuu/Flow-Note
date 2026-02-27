const Card = require('../models/Card');
const List = require('../models/List');

// [카드 생성]
exports.createCard = async (req, res) => {
  try {
    const { 
      title, 
      list_id, 
      board_id, 
      content, 
      pos, 
      status, 
      priority, 
      due_date, 
      labels, 
      checklists 
    } = req.body;

    if (!title || !list_id || !board_id) {
      return res.status(400).json({ message: '제목, 리스트ID, 보드ID는 필수입니다.' });
    }

    // 리스트 존재 유무 확인
    const listExists = await List.findById(list_id);
    if (!listExists) {
      return res.status(404).json({ message: '카드를 추가할 리스트를 찾을 수 없습니다.' });
    }

    const newCard = new Card({
      title,
      content: content || "",
      list_id,
      board_id,
      owner_id: req.user._id,
      pos: pos || 65535,
      status: status || '대기',
      priority: priority || '보통',
      due_date,
      labels: labels || [],
      checklists: checklists || []
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

// [카드 수정]
exports.updateCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $set: req.body },
      { new: true } 
    );

    if (!updatedCard) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: '카드 수정 실패', error: error.message });
  }
};

// [카드 삭제]
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }
    res.status(200).json({ message: '카드가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '카드 삭제 실패', error: error.message });
  }
};

// [카드 이동 (순서 및 리스트 변경)]
exports.moveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { list_id, pos } = req.body;

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { list_id, pos },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: '카드 이동 실패', error: error.message });
  }
};