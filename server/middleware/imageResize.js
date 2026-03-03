const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const resizeImage = async (req, res, next) => {
  // 업로드된 파일 유무 확인
  if (!req.file && (!req.files || req.files.length === 0)) {
    return next();
  }

  try {
    // 처리할 파일들을 배열로 통일
    const files = req.file ? [req.file] : req.files;

    await Promise.all(
      files.map(async (file) => {
        const originalPath = file.path;
        const ext = path.extname(file.path);
        const directory = path.dirname(file.path);
        const fileName = path.basename(file.path, ext);
        
        // 임시 파일 경로
        const newPath = path.join(directory, `resized-${fileName}${ext}`);

        // 리사이징 처리
        await sharp(originalPath)
          .resize(800)
          .jpeg({ quality: 80 })
          .toFile(newPath);

        // 원본 파일 삭제 및 리사이징된 파일로 교체
        fs.unlinkSync(originalPath);
        fs.renameSync(newPath, originalPath);
      })
    );

    next();
  } catch (error) {
    console.error('이미지 리사이징 에러:', error);
    next(); // 에러가 나도 일단 진행 (파일은 업로드된 상태이므로)
  }
};

module.exports = resizeImage;