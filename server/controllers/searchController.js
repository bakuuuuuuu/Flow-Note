const SearchHistory = require('../models/SearchHistory');
const Board = require('../models/Board');
const Card = require('../models/Card');

// [검색 기록 저장]
exports.saveSearchKeyword = async (req, res) => {
  try {
    const { keyword } = req.body;
    
    // 동일한 키워드가 이미 있다면 삭제하고 새로 저장
    await SearchHistory.deleteOne({ userId: req.user._id, keyword });

    const newHistory = await SearchHistory.create({
      userId: req.user._id,
      keyword
    });
    res.status(201).json(newHistory);
  } catch (error) {
    res.status(500).json({ message: '검색 기록 저장 실패', error: error.message });
  }
};

// [최근 검색어 조회]
exports.getRecentSearches = async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: '검색 기록 조회 실패', error: error.message });
  }
};

// [특정 검색 기록 삭제]
exports.deleteSearchHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // 본인의 검색 기록인지 확인하며 삭제
    const history = await SearchHistory.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!history) {
      return res.status(404).json({ message: '삭제할 검색 기록이 없거나 권한이 없습니다.' });
    }

    res.status(200).json({ message: '검색 기록이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '검색 기록 삭제 실패', error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || !q.trim()) {
      return res.status(400).json({ message: '검색어를 입력해주세요.' })
    }

    const keyword = q.trim()
    if (keyword.length < 2) {
      return res.status(400).json({ message: '검색어를 2글자 이상 입력해주세요.' })
    }

    const regex = new RegExp(keyword, 'i')

    const boards = await Board.find({
      owner_id: req.user._id,
      title: { $regex: regex }
    }).sort({ updatedAt: -1 }).limit(10)

    const myBoardIds = (await Board.find({ owner_id: req.user._id }).select('_id')).map(b => b._id)

    const cards = await Card.find({
      board_id: { $in: myBoardIds },
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } }
      ]
    }).sort({ updatedAt: -1 }).limit(20)

    const boardMap = {}
    const allBoards = await Board.find({ _id: { $in: cards.map(c => c.board_id) } }).select('_id title category')
    allBoards.forEach(b => { boardMap[b._id.toString()] = b })

    const cardsWithBoard = cards.map(card => ({
      ...card._doc,
      board: boardMap[card.board_id.toString()] || null
    }))

    res.status(200).json({
      keyword,
      boards,
      cards: cardsWithBoard,
      total: boards.length + cards.length
    })
  } catch (error) {
    res.status(500).json({ message: '검색 실패', error: error.message })
  }
}