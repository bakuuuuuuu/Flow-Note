const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { searchSchema } = require('../validators/searchValidator');

// [POST] 검색 키워드 저장
router.post('/history', protect, validate(searchSchema), searchController.saveSearchKeyword);

// [GET] 최근 검색어 목록 조회
router.get('/history', protect, searchController.getRecentSearches);

// [DELETE] 특정 검색 기록 삭제 (ID 기준)
router.delete('/history/:id', protect, searchController.deleteSearchHistory);

module.exports = router;