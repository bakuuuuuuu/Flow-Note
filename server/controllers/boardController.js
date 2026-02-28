const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const createNotification = require('../utils/createNotification');

// [보드 생성]
exports.createBoard = async (req, res) => {
  try {
    const { title, category, deadline, bg_theme, is_starred } = req.body;

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

    // 보드 생성 알림
    await createNotification({
      user_id: req.user._id,
      category: 'SYSTEM',
      type: 'board_created',
      title: '새 보드 생성',
      content: `'${title}' 보드가 생성되었습니다. 프로젝트를 시작해보세요!`,
      link_url: `/boards/${savedBoard._id}`
    });

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

    // 보드 수정 알림
    await createNotification({
      user_id: req.user._id,
      category: 'SYSTEM',
      type: 'board_updated',
      title: '보드 정보 수정',
      content: `'${updatedBoard.title}' 보드 정보가 업데이트되었습니다.`,
      link_url: `/boards/${updatedBoard._id}`
    });

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

    const boardTitle = board.title;

    const lists = await List.find({ board_id: id });
    const listIds = lists.map(list => list._id);
    await Card.deleteMany({ list_id: { $in: listIds } });
    await List.deleteMany({ board_id: id });

    await createNotification({
      user_id: req.user._id,
      category: 'SYSTEM',
      type: 'board_deleted',
      title: '보드 삭제 완료',
      content: `'${boardTitle}' 보드와 모든 관련 데이터가 삭제되었습니다.`,
      link_url: `/boards`
    });

    await Board.findByIdAndDelete(id);

    res.status(200).json({ message: '보드와 관련된 모든 데이터가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '보드 삭제 실패', error: error.message });
  }
};