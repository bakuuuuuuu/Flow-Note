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
      title, list_id, board_id, content, pos, status, priority, start_date, due_date, labels, checklists 
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
      start_date,
      due_date,
      labels: labels || [],
      checklists: checklists || []
    });

    const savedCard = await newCard.save();

    // 로그 생성
    await Activity.create({
      board_id, 
      card_id: savedCard._id, 
      user_id: req.user._id,
      action_type: 'CREATE',
      action: '카드 생성',
      details: `'${title}' 카드가 생성되었습니다.`
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

    // 변경 전 데이터 확보
    const oldCard = await Card.findById(cardId);
    if (!oldCard) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    // 마감일(due_date)이 수정되면 알림 발송 상태를 false로 초기화
    const updateData = { ...req.body };
    if (updateData.due_date) {
      updateData.is_notified = false;
    }

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    // 어떤 필드가 바뀌었는지 비교하여 활동 로그(Activity) 생성
    const fieldsToTrack = ['title', 'status', 'priority', 'due_date', 'content'];
    
    for (const field of fieldsToTrack) {
      // 요청 데이터에 해당 필드가 있고, 실제 값이 문자열 기준으로 변했을 때만 실행
      if (req.body[field] !== undefined && String(oldCard[field] || "") !== String(updatedCard[field] || "")) {
        
        let detailMsg = `'${field}' 필드가 수정되었습니다.`;
        
        if (field === 'status') {
          detailMsg = `상태를 [${oldCard.status}]에서 [${updatedCard.status}](으)로 변경했습니다.`;
        } else if (field === 'priority') {
          detailMsg = `우선순위를 [${oldCard.priority}]에서 [${updatedCard.priority}](으)로 변경했습니다.`;
        } else if (field === 'title') {
          detailMsg = `제목을 '${oldCard.title}'에서 '${updatedCard.title}'(으)로 변경했습니다.`;
        } else if (field === 'due_date') {
          detailMsg = `마감일을 변경했습니다.`;
        } else if (field === 'content') {
          detailMsg = `카드 상세 설명을 업데이트했습니다.`;
        }

        // 활동 로그 기록
        await Activity.create({
          board_id: updatedCard.board_id,
          card_id: updatedCard._id,
          user_id: req.user._id,
          action_type: 'UPDATE', 
          action: '카드 수정',
          field: field,
          old_value: oldCard[field],
          new_value: updatedCard[field],
          details: detailMsg
        });
      }
    }

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: '카드 수정 실패', error: error.message });
  }
};

// [카드 삭제]
exports.deleteCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const card = await Card.findById(cardId);
    
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    // 카드 삭제 시 실제 서버 내 첨부 파일들도 삭제
    if (card.attachments && card.attachments.length > 0) {
      card.attachments.forEach(file => {
        const filePath = path.join(__dirname, '..', file.fileUrl.substring(1));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    const { board_id, title: card_title } = card;

    // 해당 카드와 관련된 모든 활동 로그(Activity) 삭제
    await Activity.deleteMany({ card_id: cardId });

    // 누가 지웠는지 로그 생성
    await Activity.create({
      board_id,
      user_id: req.user._id,
      action_type: 'DELETE',
      action: '카드 삭제',
      details: `'${card_title}' 카드가 삭제되었습니다.`
    });

    // 카드 본체 삭제
    await Card.findByIdAndDelete(cardId);

    res.status(200).json({ message: '카드와 관련 로그가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '카드 삭제 실패', error: error.message });
  }
};

// [카드 이동 (순서 및 리스트 변경)]
exports.moveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { list_id, pos } = req.body;

    const oldCard = await Card.findById(cardId).populate('list_id', 'title');
    if (!oldCard) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      cardId, { list_id, pos }, { returnDocument: 'after' }
    ).populate('list_id', 'title');

    // 리스트(list_id)가 변경된 경우에만 '활동 로그' 생성
    if (oldCard.list_id._id.toString() !== list_id.toString()) {
      await Activity.create({
        board_id: updatedCard.board_id,
        card_id: updatedCard._id,
        user_id: req.user._id,
        action_type: 'MOVE',
        action: '카드 이동',
        details: `카드를 [${oldCard.list_id.title}]에서 [${updatedCard.list_id.title}](으)로 이동했습니다.`,
        old_value: oldCard.list_id.title,
        new_value: updatedCard.list_id.title
      });
    }

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
      { returnDocument: 'after' }
    );

    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    // 파일 업로드 활동 로그 생성
    await Activity.create({
      board_id: card.board_id,
      card_id: card._id,
      user_id: req.user._id,
      action_type: 'ATTACHMENT',
      action: '파일 업로드',
      details: `'${newAttachments[0].fileName}'${newAttachments.length > 1 ? ` 외 ${newAttachments.length - 1}개` : ''} 파일을 첨부했습니다.`
    });

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

    const fileName = attachment.fileName;

    // 서버에서 실제 파일 삭제
    const filePath = path.join(__dirname, '..', attachment.fileUrl.substring(1));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // DB에서 정보 제거
    card.attachments.pull(attachmentId);
    await card.save();

    // 파일 삭제 활동 로그 생성
    await Activity.create({
      board_id: card.board_id,
      card_id: card._id,
      user_id: req.user._id,
      action_type: 'ATTACHMENT_DELETE',
      action: '파일 삭제',
      details: `'${fileName}' 파일을 삭제했습니다.`,
      old_value: fileName,
      new_value: null
    });

    res.status(200).json({ 
      message: '첨부파일이 삭제되었습니다.', 
      attachments: card.attachments 
    });

  } catch (error) {
    res.status(500).json({ message: '파일 삭제 실패', error: error.message });
  }
};