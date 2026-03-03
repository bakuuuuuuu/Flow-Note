const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createNotification = require('../utils/createNotification');
const fs = require('fs');
const path = require('path');

// [회원가입]
exports.registerUser = async (req, res) => {
  try {
    const { email, password, nickname, name, gender, birthdate, phone } = req.body;

    // 이메일 중복 확인
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    }

    // 닉네임 중복 확인
    const nicknameExists = await User.findOne({ nickname });
    if (nicknameExists) {
      return res.status(400).json({ message: '이미 사용 중인 닉네임입니다.' });
    }

    // 비밀번호 암호화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // DB에 유저 정보 저장
    const user = await User.create({
      email,
      password: hashedPassword,
      nickname,
      name,
      gender,
      birthdate,
      phone,
    });

    // 회원가입 환영 알림 추가
    await createNotification({
      user_id: user._id,
      category: 'SYSTEM',
      type: 'welcome',
      title: '회원가입을 환영합니다! 🎉',
      content: `${nickname}님, Flow-Note의 회원이 되신 것을 진심으로 환영합니다. 지금 바로 첫 보드를 만들어보세요!`,
      link_url: '/boards'
    });

    // 성공 메시지 및 데이터 반환
    res.status(201).json({
      message: '회원가입 성공!',
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        gender: user.gender
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '중복된 값이 존재합니다.' });
    }
    res.status(500).json({ message: '서버 에러 발생', error: error.message });
  }
};

// [로그인]
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '가입되지 않은 이메일입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: '로그인 성공!',
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname
      }
    });

  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message });
  }
};

// [내 프로필 정보 조회]
exports.getUserProfile = async (req, res) => { 
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.status(200).json({
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        profile_img: user.profile_img || null, // 이미지가 없으면 null 반환
        status_message: user.status_message || "",
      });
    } else {
      res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }
  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message });
  }
};

// [프로필 이미지 업데이트]
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 없습니다.' });
    }

    // 현재 유저 정보 가져오기
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    // 기존 이미지 서버에서 삭제
    if (user.profile_img) {
      const oldPath = path.join(__dirname, '..', user.profile_img.substring(1));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // 새 이미지 경로 저장
    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
    user.profile_img = imagePath;
    await user.save();

    res.status(200).json({
      message: '프로필 이미지가 변경되었습니다.',
      profile_img: user.profile_img
    });

  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message });
  }
};

// [프로필 이미지 삭제 (기본 이미지로 돌아가기)]
exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    // 서버에 실제 파일이 있다면 삭제
    if (user.profile_img) {
      const filePath = path.join(__dirname, '..', user.profile_img.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // DB에서 이미지 경로 비우기
    user.profile_img = null; // 또는 ""
    await user.save();

    res.status(200).json({ message: '프로필 이미지가 삭제되었습니다.' });

  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message });
  }
};