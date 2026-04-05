const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const type = req.baseUrl.includes('users') ? 'profiles' : 'cards';
    const uploadPath = path.join('uploads', type, year.toString(), month);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 한글 파일명 깨짐 방지
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('이미지 파일(jpg, jpeg, png, gif)만 업로드 가능합니다.'), false)
  }
}

const anyFilter = (req, file, cb) => {
  cb(null, true)
}

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
})

const uploadFile = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: anyFilter,
})

module.exports = { uploadImage, uploadFile }