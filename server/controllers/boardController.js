const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const createNotification = require('../utils/createNotification');
const fs = require('fs');
const path = require('path');

// [보드 생성]
exports.createBoard = async (req, res) => {
  try {
    const { title, category, deadline, bg_theme, is_starred, lists } = req.body;

    const newBoard = new Board({
      title,
      category,
      deadline,
      is_starred: is_starred || false,
      bg_theme: bg_theme || 'default-theme',
      owner_id: req.user._id,
      members: [{ user_id: req.user._id, role: 'admin' }]
    });

    const savedBoard = await newBoard.save();

    // 리스트 생성 (프론트에서 받은 이름으로, pos는 순서대로)
    const listTitles = lists && lists.length > 0
      ? lists
      : ['할 일', '진행 중', '완료']

    await Promise.all(
      listTitles.map((title, index) =>
        List.create({
          title,
          board_id: savedBoard._id,
          pos: (index + 1) * 65535,
        })
      )
    )

    res.status(201).json(savedBoard);
  } catch (error) {
    res.status(500).json({ message: '보드 생성 중 에러 발생', error: error.message });
  }
};

// [내 보드 목록 조회]
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

// [특정 보드 상세 조회 (ID 기준)]
exports.getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board || board.owner_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: '보드를 찾을 수 없거나 권한이 없습니다.' });
    }

    const lists = await List.find({ board_id: req.params.id }).sort('pos');

    const listsWithCards = await Promise.all(
      lists.map(async (list) => {
        const cards = await Card.find({ list_id: list._id }).sort('pos');
        return {
          ...list._doc,
          cards: cards
        };
      })
    );

    res.status(200).json({
      ...board._doc,
      lists: listsWithCards
    });
  } catch (error) {
    res.status(500).json({ message: '보드 상세 조회 실패', error: error.message });
  }
};

// [보드 정보 수정]
exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, deadline, bg_theme, is_starred } = req.body;

    let board = await Board.findById(id);
    if (!board || board.owner_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: '보드를 찾을 수 없거나 권한이 없습니다.' });
    }

    board.title = title || board.title;
    board.category = category || board.category;
    board.deadline = deadline || board.deadline;
    board.bg_theme = bg_theme || board.bg_theme;
    if (is_starred !== undefined) board.is_starred = is_starred;

    const updatedBoard = await board.save();

    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: '보드 수정 실패', error: error.message });
  }
};

// [보드 삭제]
exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board || board.owner_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: '보드를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 해당 보드에 속한 모든 카드를 찾아서 파일부터 삭제
    const cards = await Card.find({ board_id: id });
    
    for (const card of cards) {
      if (card.attachments && card.attachments.length > 0) {
        card.attachments.forEach(file => {
          const filePath = path.join(__dirname, '..', file.fileUrl.substring(1));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    }

    // DB 데이터 삭제 (카드 -> 리스트 -> 보드 순)
    await Card.deleteMany({ board_id: id });
    await List.deleteMany({ board_id: id });
    await Board.findByIdAndDelete(id);

    res.status(200).json({ message: '보드와 관련된 모든 데이터 및 파일이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '보드 삭제 실패', error: error.message });
  }
};