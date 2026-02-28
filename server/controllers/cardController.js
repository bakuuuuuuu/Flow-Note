const Card = require('../models/Card');
const List = require('../models/List');
const Activity = require('../models/Activity');
const createNotification = require('../utils/createNotification');

// [카드 상세 조회]
exports.getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    const activities = await Activity.find({ card_id: id })
      .populate('user_id', 'name profile_img')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      ...card._doc,
      activities: activities || []
    });
  } catch (error) {
    res.status(500).json({ message: '카드 상세 조회 실패', error: error.message });
  }
};

// [카드 생성]
exports.createCard = async (req, res) => {
  try {
    const { 
      title, list_id, board_id, content, pos, status, priority, due_date, labels, checklists 
    } = req.body;

    if (!title || !list_id || !board_id) {
      return res.status(400).json({ message: '제목, 리스트ID, 보드ID는 필수입니다.' });
    }

    const listExists = await List.findById(list_id);
    if (!listExists) {
      return res.status(404).json({ message: '카드를 추가할 리스트를 찾을 수 없습니다.' });
    }

    const newCard = new Card({
      title, content: content || "", list_id, board_id,
      owner_id: req.user._id,
      pos: pos || 65535,
      status: status || '대기',
      priority: priority || '보통',
      due_date, labels: labels || [], checklists: checklists || []
    });

    const savedCard = await newCard.save();

    await Activity.create({
      board_id, card_id: savedCard._id, user_id: req.user._id,
      action: '카드 생성',
      details: `'${title}' 카드가 생성되었습니다.`
    });

    // 카드 생성 알림
    await createNotification({
      user_id: req.user._id,
      category: 'UPDATE',
      type: 'card_created',
      title: '새 카드 생성',
      content: `'${title}' 카드가 성공적으로 생성되었습니다.`,
      link_url: `/cards/${savedCard._id}`
    });
    
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({ message: '카드 생성 중 에러 발생', error: error.message });
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

    await Activity.create({
      board_id: updatedCard.board_id,
      card_id: updatedCard._id,
      user_id: req.user._id,
      action: '카드 수정',
      details: `'${updatedCard.title}' 카드가 수정되었습니다.`
    });

    await createNotification({
      user_id: req.user._id,
      category: 'UPDATE',
      type: 'card_updated',
      title: '노트 업데이트',
      content: `'${updatedCard.title}' 카드의 상세 정보가 변경되었습니다.`,
      link_url: `/cards/${updatedCard._id}`
    });

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: '카드 수정 실패', error: error.message });
  }
};

// [카드 삭제]
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    const { board_id, title: card_title } = card;

    await createNotification({
      user_id: req.user._id,
      category: 'UPDATE',
      type: 'card_deleted',
      title: '카드 삭제',
      content: `'${card_title}' 카드가 삭제되었습니다.`,
      link_url: `/boards/${board_id}`
    });

    await Activity.create({
      board_id, user_id: req.user._id,
      action: '카드 삭제',
      details: `'${card_title}' 카드가 삭제되었습니다.`
    });

    await Card.findByIdAndDelete(req.params.id);

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
      cardId, { list_id, pos }, { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    await Activity.create({
      board_id: updatedCard.board_id,
      card_id: updatedCard._id,
      user_id: req.user._id,
      action: '카드 이동',
      details: `'${updatedCard.title}' 카드의 위치가 변경되었습니다.`
    });

    await createNotification({
      user_id: req.user._id,
      category: 'UPDATE',
      type: 'card_moved',
      title: '카드 위치 이동',
      content: `'${updatedCard.title}' 카드가 다른 리스트로 이동되었습니다.`,
      link_url: `/cards/${updatedCard._id}`
    });

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: '카드 이동 실패', error: error.message });
  }
};