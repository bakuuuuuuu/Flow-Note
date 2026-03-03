const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 저장 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // 요청 경로(baseUrl)를 확인해서 프로필인지 카드인지 구분
    const type = req.baseUrl.includes('users') ? 'profiles' : 'cards';

    // 최종 경로 생성
    const uploadPath = path.join('uploads', type, year.toString(), month);

    // 폴더가 없으면 하위 폴더까지 재귀적으로 생성
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 파일명 중복 방지
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// 파일 필터링
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일(jpg, jpeg, png, gif)만 업로드 가능합니다.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한
  fileFilter: fileFilter
});

module.exports = upload;