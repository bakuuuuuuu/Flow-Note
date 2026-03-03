const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');
const resizeImage = require('../middleware/imageResize');

// [POST] 카드 생성
router.post('/', protect, cardController.createCard);

// [PATCH] 카드 수정
router.patch('/:id', protect, cardController.updateCard);

// [DELETE] 카드 삭제
router.delete('/:id', protect, cardController.deleteCard);

// [PATCH] 카드 이동
router.patch('/:cardId/move', protect, cardController.moveCard);

// [GET] 카드 상세 조회
router.get('/:id', protect, cardController.getCardById);

// [POST] 카드 첨부 파일 업로드
router.post(
  '/:id/upload', 
  protect, 
  upload.array('attachments', 5), 
  resizeImage,
  cardController.uploadCardAttachments
);

// [DELETE] 카드 첨부 파일 개별 삭제
router.delete('/:id/attachments/:attachmentId', protect, cardController.deleteCardAttachment);

module.exports = router;