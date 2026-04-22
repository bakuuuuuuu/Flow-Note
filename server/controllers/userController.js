const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createNotification = require('../utils/createNotification');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Board = require('../models/Board')
const Card = require('../models/Card')
const List = require('../models/List')
const Notification = require('../models/Notification')
const Activity = require('../models/Activity')
const SearchHistory = require('../models/SearchHistory')
const { registerSchema, loginSchema, resetPasswordSchema } = require('../validators/userValidator');

// [닉네임 중복 확인]
exports.checkNickname = async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ message: '닉네임을 입력해주세요.' });
    }
    const exists = await User.findOne({ nickname: nickname.trim() });
    if (exists) {
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
    }
    res.status(200).json({ message: '사용 가능한 닉네임입니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message });
  }
};

// [회원가입]
exports.registerUser = async (req, res) => {
  try {
    // 입력값 유효성 검사
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, nickname, name, gender, birthdate, phone, agreed } = req.body;

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
      agreed_at: agreed ? new Date() : null,
    });

    // 회원가입 환영 알림 추가
    await createNotification({
      user_id: user._id,
      category: 'SYSTEM',
      type: 'welcome',
      title: '회원가입을 환영합니다! 🎉',
      content: `${nickname}님, Flow-Note의 회원이 되신 것을 진심으로 환영합니다. 지금 바로 첫 보드를 만들어보세요!`,
      link_url: '/home'
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
    // 입력값 유효성 검사
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

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
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        profile_img: user.profile_img || null
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
    // 새 비밀번호 유효성 검사 (회원가입과 동일한 조건 적용)
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

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
        is_profile_complete: user.is_profile_complete,
        provider: user.provider,
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

// [프로필 수정 (닉네임, 상태메시지)]
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, status_message } = req.body

    // 닉네임 중복 확인 (본인 제외)
    if (nickname) {
      const exists = await User.findOne({ nickname, _id: { $ne: req.user._id } })
      if (exists) {
        return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' })
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { nickname, status_message } },
      { new: true, runValidators: true }
    ).select('-password')

    res.status(200).json({
      message: '프로필이 수정되었습니다.',
      user: {
        _id: updated._id,
        email: updated.email,
        nickname: updated.nickname,
        name: updated.name,
        profile_img: updated.profile_img,
        status_message: updated.status_message,
      }
    })
  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message })
  }
}

// [비밀번호 변경 (로그인 상태에서)]
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' })
    }

    const user = await User.findById(req.user._id)
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' })
    }

    // 새 비밀번호 유효성 검사
    const { error } = require('../validators/userValidator').resetPasswordSchema.validate({ password: newPassword })
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.status(200).json({ message: '비밀번호가 변경되었습니다.' })
  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message })
  }
}

// [회원 탈퇴]
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    // 소셜 로그인 유저는 비밀번호 검증 생략
    if (user.provider === 'local') {
      if (!password) {
        return res.status(400).json({ message: '비밀번호를 입력해주세요.' })
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' })
      }
    }

    // 연관 데이터 삭제
    const userBoards = await Board.find({ owner_id: req.user._id })
    const boardIds = userBoards.map(b => b._id)

    await Activity.deleteMany({ board_id: { $in: boardIds } })  // 활동 기록
    await Card.deleteMany({ board_id: { $in: boardIds } })       // 카드
    await List.deleteMany({ board_id: { $in: boardIds } })       // 리스트
    await Board.deleteMany({ owner_id: req.user._id })           // 보드
    await Notification.deleteMany({ user_id: req.user._id })     // 알림
    await SearchHistory.deleteMany({ userId: req.user._id })     // 검색기록
    await User.findByIdAndDelete(req.user._id)                   // 유저

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Lax' })
    res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' })
  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message })
  }
}

// [소셜 로그인 추가 정보 입력]
exports.socialSetup = async (req, res) => {
  try {
    const { nickname, gender, birthdate, phone } = req.body

    // 닉네임 중복 확인
    const exists = await User.findOne({ nickname, _id: { $ne: req.user._id } })
    if (exists) {
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' })
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          nickname,
          gender,
          birthdate,
          phone,
          is_profile_complete: true,
        }
      },
      { new: true }
    ).select('-password')

    res.status(200).json({
      message: '프로필 설정이 완료되었습니다.',
      user: {
        _id: updated._id,
        email: updated.email,
        nickname: updated.nickname,
        name: updated.name,
        profile_img: updated.profile_img,
        status_message: updated.status_message,
        is_profile_complete: updated.is_profile_complete,
      }
    })
  } catch (error) {
    res.status(500).json({ message: '서버 에러 발생', error: error.message })
  }
}