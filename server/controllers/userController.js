const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createNotification = require('../utils/createNotification');

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
  const user = req.user;

  if (user) {
    res.json({
      _id: user._id,
      email: user.email,
      nickname: user.nickname,
    });
  } else {
    res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
  }
};