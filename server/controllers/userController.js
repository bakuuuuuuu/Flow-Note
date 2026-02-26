const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    // 예외 처리
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

    // 회원가입 유무 확인
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '가입되지 않은 이메일입니다.' });
    }

    // 비밀번호 일치 유무 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
    }

    // 로그인 성공 시 토큰 생성
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 토큰을 포함한 응답 보내기
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
    // 예외 처리
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