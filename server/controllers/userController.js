const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createNotification = require('../utils/createNotification');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

    // Access Token 발급 (단기 - 15분)
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Refresh Token 발급 (장기 - 7일)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'flow_note_refresh_key_2024',
      { expiresIn: '7d' }
    );

    // Refresh Token을 보안 쿠키(HttpOnly)에 저장
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // 클라이언트 자바스크립트에서 접근 불가 (보안)
      secure: process.env.NODE_ENV === 'production', // 배포 환경(HTTPS)에서만 전송
      sameSite: 'Lax', // CSRF 공격 방지
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일 유지
    });

    res.status(200).json({
      message: '로그인 성공!',
      accessToken, // 클라이언트는 메모리에 저장
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

// Refresh Token를 통한 Access Token 재발급
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    // Refresh Token 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'flow_note_refresh_key_2024');
    
    // 검증 성공 시 새로운 Access Token 생성
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: '유효하지 않은 토큰입니다. 다시 로그인해주세요.' });
  }
};

// [로그아웃]
exports.logoutUser = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'Lax'
  });
  res.status(200).json({ message: '로그아웃 되었습니다.' });
};

// [비밀번호 재설정 메일 발송]
exports.forgotPassword = async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    // 본인 확인 (이메일, 이름, 전화번호 일치 여부)
    const user = await User.findOne({ email, name, phone });
    if (!user) {
      return res.status(404).json({ message: '일치하는 유저 정보가 없습니다.' });
    }

    // 랜덤 토큰 생성
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 토큰 해싱하여 DB 저장 및 만료시간(1시간) 설정
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; 

    await user.save();

    // 메일 전송 설정
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: 'Flow-Note <noreply@flownote.com>',
      subject: '[Flow-Note] 비밀번호 재설정 안내',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #333;">비밀번호 재설정 요청</h2>
          <p>안녕하세요, ${user.nickname}님.</p>
          <p>비밀번호를 변경하시려면 아래 버튼을 클릭하세요. 이 링크는 1시간 동안만 유효합니다.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">비밀번호 재설정하기</a>
          <p>만약 본인이 요청한 것이 아니라면 이 메일을 무시하셔도 됩니다.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: '재설정 링크가 이메일로 발송되었습니다.' });

  } catch (error) {
    res.status(500).json({ message: '메일 발송 중 오류 발생', error: error.message });
  }
};

// [비밀번호 실제 재설정]
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }

    // 새 비밀번호 해싱 및 저장
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // 토큰 정보 초기화
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '비밀번호 재설정 오류', error: error.message });
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