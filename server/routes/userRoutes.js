const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');
const resizeImage = require('../middleware/imageResize');

// [POST] 회원가입
router.post('/register', userController.registerUser);

// [POST] 로그인
router.post('/login', userController.loginUser);

// [GET] 내 프로필 보기 (로그인한 사람만 가능)
router.get('/profile', protect, userController.getUserProfile);

// [PATCH] 프로필 이미지 업데이트
router.patch(
  '/profile/image', 
  protect, 
  upload.single('profile_img'), 
  resizeImage,
  userController.updateProfileImage
);

// [DELETE] 프로필 이미지 삭제 (기본 이미지로 변경)
router.delete('/profile/image', protect, userController.deleteProfileImage);

module.exports = router;