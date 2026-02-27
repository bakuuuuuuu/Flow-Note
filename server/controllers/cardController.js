const Card = require('../models/Card');
const List = require('../models/List');
const Activity = require('../models/Activity');

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
    console.log("✅ 1단계: 카드 저장 완료 ->", savedCard._id);

    // [디버깅] 로그 생성 시도
    try {
      console.log("🚀 2단계: 활동 로그 생성 시도 중...");
      const activityData = {
        board_id: board_id,
        card_id: savedCard._id,
        user_id: req.user._id,
        action: '카드 생성',
        details: `'${title}' 카드가 생성되었습니다.`
      };
      console.log("📝 로그 데이터 확인:", activityData);

      const newLog = await Activity.create(activityData);
      console.log("✨ 3단계: 활동 로그 저장 성공! ID:", newLog._id);
    } catch (logError) {
      console.error("❌ 활동 로그 생성 중 발생한 개별 에러:", logError);
    }
    
    res.status(201).json(savedCard);
  } catch (error) {
    console.error("🔥 전체 프로세스 에러:", error);
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

    // 수정 로그 남기기
    await Activity.create({
      board_id: updatedCard.board_id,
      card_id: updatedCard._id,
      user_id: req.user._id,
      action: '카드 수정',
      details: `'${updatedCard.title}' 카드가 수정되었습니다.`
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

    const board_id = card.board_id;
    const card_title = card.title;

    await Card.findByIdAndDelete(req.params.id);

    // 삭제 로그 남기기
    await Activity.create({
      board_id,
      user_id: req.user._id,
      action: '카드 삭제',
      details: `'${card_title}' 카드가 삭제되었습니다.`
    });

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

    // 이동 로그 남기기
    await Activity.create({
      board_id: updatedCard.board_id,
      card_id: updatedCard._id,
      user_id: req.user._id,
      action: '카드 이동',
      details: `'${updatedCard.title}' 카드가 이동되었습니다.`
    });

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: '카드 이동 실패', error: error.message });
  }
};