const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadImage } = require('../utils/upload');
const resizeImage = require('../middleware/imageResize');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/userValidator');

// [GET] 닉네임 중복 확인
router.get('/check-nickname', userController.checkNickname);

// [POST] 회원가입
router.post('/register', validate(registerSchema), userController.registerUser);

// [POST] 로그인
router.post('/login', validate(loginSchema), userController.loginUser);

// [POST] 토큰 재발급 (쿠키의 Refresh Token 사용)
router.post('/refresh', userController.refreshToken);

// [POST] 로그아웃
router.post('/logout', userController.logoutUser);

// [POST] 비밀번호 변경 요청
router.post('/forgot-password', userController.forgotPassword);

// [PATCH] 비밀번호 변경
router.patch('/reset-password/:token', userController.resetPassword);

// [GET] 내 프로필 보기
router.get('/profile', protect, userController.getUserProfile);

// [PATCH] 프로필 이미지 업데이트
router.patch(
  '/profile/image',
  protect,
  uploadImage.single('profile_img'),
  resizeImage,
  userController.updateProfileImage
);

// [DELETE] 프로필 이미지 삭제
router.delete('/profile/image', protect, userController.deleteProfileImage);

// [PATCH] 프로필 수정 (닉네임, 상태메시지)
router.patch('/profile', protect, userController.updateProfile)

// [PATCH] 비밀번호 변경 (로그인 상태)
router.patch('/password', protect, userController.updatePassword)

// [DELETE] 회원 탈퇴
router.delete('/account', protect, userController.deleteAccount)

module.exports = router;