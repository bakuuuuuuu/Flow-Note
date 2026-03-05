const Card = require('../models/Card');
const List = require('../models/List');
const Activity = require('../models/Activity');
const createNotification = require('../utils/createNotification');
const fs = require('fs');
const path = require('path');

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
    
    // 마감일(due_date)이 수정되면 알림 발송 상태를 false로 초기화
    const updateData = { ...req.body };
    if (updateData.due_date) {
      updateData.is_notified = false;
    }

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $set: updateData },
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

    // 카드 삭제 시 실제 파일들도 삭제
    if (card.attachments && card.attachments.length > 0) {
      card.attachments.forEach(file => {
        const filePath = path.join(__dirname, '..', file.fileUrl.substring(1));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
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

// [카드 첨부 파일 업로드]
exports.uploadCardAttachments = async (req, res) => {
  try {
    const cardId = req.params.id;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }

    // 파일 정보 배열 생성
    const newAttachments = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/${file.path.replace(/\\/g, '/')}`,
      fileSize: file.size,
      fileType: file.mimetype
    }));

    // DB 업데이트
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $push: { attachments: { $each: newAttachments } } },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      message: '파일 업로드 성공!',
      attachments: card.attachments
    });

  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message });
  }
};

// [카드 첨부 파일 개별 삭제]
exports.deleteCardAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });

    // 삭제할 파일 정보 찾기
    const attachment = card.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ message: '첨부파일을 찾을 수 없습니다.' });

    // 서버에서 실제 파일 삭제
    const filePath = path.join(__dirname, '..', attachment.fileUrl.substring(1));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // DB에서 정보 제거
    card.attachments.pull(attachmentId);
    await card.save();

    res.status(200).json({ 
      message: '첨부파일이 삭제되었습니다.', 
      attachments: card.attachments 
    });

  } catch (error) {
    res.status(500).json({ message: '파일 삭제 실패', error: error.message });
  }
};