const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const KakaoStrategy = require('passport-kakao').Strategy
const NaverStrategy = require('passport-naver-v2').Strategy
const User = require('../models/User')
const createNotification = require('../utils/createNotification')

// ── 구글 전략 ──
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value
    const name = profile.displayName
    const social_id = profile.id

    let user = await User.findOne({ social_id, provider: 'google' })
    if (user) return done(null, user)

    user = await User.findOne({ email })
    if (user) {
      return done(null, false, { message: '이미 일반 가입된 이메일입니다. 일반 로그인을 이용해주세요.' })
    }

    const nickname = `google_${social_id.slice(0, 8)}`
    user = await User.create({
      email,
      name,
      nickname,
      provider: 'google',
      social_id,
      gender: '선택안함',
      birthdate: new Date('2000-01-01'),
      phone: '000-0000-0000',
      agreed_at: new Date(),
      is_profile_complete: false,
    })

    await createNotification({
      user_id: user._id,
      category: 'SYSTEM',
      type: 'welcome',
      title: '회원가입을 환영합니다! 🎉',
      content: `${name}님, Flow-Note의 회원이 되신 것을 진심으로 환영합니다. 지금 바로 첫 보드를 만들어보세요!`,
      link_url: '/home'
    })

    return done(null, user)
  } catch (err) {
    return done(err)
  }
}))

// ── 카카오 전략 ──
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  callbackURL: process.env.KAKAO_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const social_id = String(profile.id)
    const name = profile.displayName || profile.username || '카카오유저'
    const email = profile._json?.kakao_account?.email || `kakao_${social_id}@flownote.com`

    // 1. 기존 카카오 회원 확인
    let user = await User.findOne({ social_id, provider: 'kakao' })
    if (user) return done(null, user)

    // 2. 같은 이메일로 일반 가입한 회원 확인
    if (profile._json?.kakao_account?.email) {
      user = await User.findOne({ email, provider: 'local' })
      if (user) {
        return done(null, false, { message: '이미 일반 가입된 이메일입니다. 일반 로그인을 이용해주세요.' })
      }
    }

    // 3. 신규 회원 → 자동 가입
    const nickname = `kakao_${social_id.slice(0, 8)}`
    user = await User.create({
      email,
      name,
      nickname,
      provider: 'kakao',
      social_id,
      gender: '선택안함',
      birthdate: new Date('2000-01-01'),
      phone: '000-0000-0000',
      agreed_at: new Date(),
      is_profile_complete: false,
    })

    await createNotification({
      user_id: user._id,
      category: 'SYSTEM',
      type: 'welcome',
      title: '회원가입을 환영합니다! 🎉',
      content: `${name}님, Flow-Note의 회원이 되신 것을 진심으로 환영합니다. 지금 바로 첫 보드를 만들어보세요!`,
      link_url: '/home'
    })

    return done(null, user)
  } catch (err) {
    return done(err)
  }
}))

// ── 네이버 전략 ──
passport.use(new NaverStrategy({
  clientID: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  callbackURL: process.env.NAVER_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const social_id = String(profile.id)
    const name = profile.name || profile.displayName || '네이버유저'
    const email = profile.email || `naver_${social_id}@flownote.com`

    // 1. 기존 네이버 회원 확인
    let user = await User.findOne({ social_id, provider: 'naver' })
    if (user) return done(null, user)

    // 2. 같은 이메일로 가입한 회원 확인
    if (profile.email) {
      user = await User.findOne({ email })
      if (user) {
        return done(null, false, { message: '이미 가입된 이메일입니다.' })
      }
    }

    // 3. 신규 회원 → 자동 가입
    const nickname = `naver_${social_id.slice(0, 8)}`
    user = await User.create({
      email,
      name,
      nickname,
      provider: 'naver',
      social_id,
      gender: '선택안함',
      birthdate: new Date('2000-01-01'),
      phone: '000-0000-0000',
      agreed_at: new Date(),
      is_profile_complete: false,
    })

    await createNotification({
      user_id: user._id,
      category: 'SYSTEM',
      type: 'welcome',
      title: '회원가입을 환영합니다! 🎉',
      content: `${name}님, Flow-Note의 회원이 되신 것을 진심으로 환영합니다. 지금 바로 첫 보드를 만들어보세요!`,
      link_url: '/home'
    })

    return done(null, user)
  } catch (err) {
    return done(err)
  }
}))

module.exports = passport