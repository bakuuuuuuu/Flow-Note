const List = require('../models/List');
const Board = require('../models/Board');
const Card = require('../models/Card');
const fs = require('fs');
const path = require('path');

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

// [리스트 수정]
exports.updateList = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 보드 소유권 확인
    const list = await List.findById(id).populate('board_id');
    if (!list || list.board_id.owner_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: '리스트를 찾을 수 없거나 권한이 없습니다.' });
    }

    const updatedList = await List.findByIdAndUpdate(
      id, 
      { $set: req.body }, 
      { new: true }
    );
    
    res.status(200).json(updatedList);
  } catch (error) {
    res.status(500).json({ message: '리스트 수정 실패', error: error.message });
  }
};

// [리스트 삭제]
exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params;

    // 삭제 전 권한 체크
    const listToCheck = await List.findById(id).populate('board_id');
    if (!listToCheck || listToCheck.board_id.owner_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: '리스트를 찾을 수 없거나 권한이 없습니다.' });
    }

    const cards = await Card.find({ list_id: id });

    // 카드들을 돌면서 첨부파일이 있다면 서버에서 실제 파일 삭제
    for (const card of cards) {
      if (card.attachments && card.attachments.length > 0) {
        card.attachments.forEach((file) => {
          const filePath = path.join(__dirname, '..', file.fileUrl.substring(1));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    }

    // DB 데이터 삭제
    await Card.deleteMany({ list_id: id });
    await List.findByIdAndDelete(id);

    res.status(200).json({ message: '리스트와 포함된 카드, 첨부파일이 모두 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '리스트 삭제 실패', error: error.message });
  }
};