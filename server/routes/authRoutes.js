const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const jwt = require('jsonwebtoken')

// 구글 로그인 시작
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

// 구글 콜백
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=social_failed`
  }),
  (req, res) => {
    const user = req.user

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`)
  }
)

// 카카오 로그인 시작
router.get('/kakao',
  passport.authenticate('kakao', { session: false })
)

// 카카오 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=social_failed`
  }),
  (req, res) => {
    const user = req.user

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'flow_note_refresh_key_2024',
      { expiresIn: '7d' }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`)
  }
)

// 네이버 로그인 시작
router.get('/naver',
  passport.authenticate('naver', { session: false })
)

// 네이버 콜백
router.get('/naver/callback',
  passport.authenticate('naver', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=social_failed`
  }),
  (req, res) => {
    const user = req.user

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'flow_note_refresh_key_2024',
      { expiresIn: '7d' }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`)
  }
)

module.exports = router