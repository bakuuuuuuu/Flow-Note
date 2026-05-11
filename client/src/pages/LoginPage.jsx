import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../api/authApi'
import useAuthStore from '../store/authStore'
import SocialButtons from '../components/common/SocialButtons'
import toast from 'react-hot-toast'
import { inputStyle, labelStyle, onFocus, onBlur } from '../utils/authStyles.jsx'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [searchParams] = useSearchParams()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await login(form)
      setAccessToken(data.accessToken)
      setUser(data.user)
      toast.success('로그인 되었습니다 👋')
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'social_failed') {
      toast.error('이미 일반 가입된 이메일이에요. 일반 로그인을 이용해주세요.')
    }
  }, [])

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: 'clamp(22px, 2vw, 28px)', fontWeight: 800, color: '#e8eaf0', letterSpacing: '-0.04em', marginBottom: '8px', lineHeight: 1.2 }}>
          다시 만나서 반가워요
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(232,234,240,0.4)', lineHeight: 1.6 }}>
          Flow-Note에 로그인하세요.
        </p>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>이메일</label>
        <input
          name="email" type="email" autoComplete="email"
          placeholder="name@example.com"
          value={form.email} onChange={handleChange} onKeyDown={handleKeyDown}
          style={inputStyle} onFocus={onFocus} onBlur={onBlur}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={labelStyle}>비밀번호</label>
        <div style={{ position: 'relative' }}>
          <input
            name="password" type={showPw ? 'text' : 'password'}
            autoComplete="current-password" placeholder="••••••••"
            value={form.password} onChange={handleChange} onKeyDown={handleKeyDown}
            style={{ ...inputStyle, paddingRight: '44px' }}
            onFocus={onFocus} onBlur={onBlur}
          />
          <button
            type="button" onClick={() => setShowPw(p => !p)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            {showPw
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <span
          onClick={() => navigate('/forgot-password')}
          style={{ fontSize: '12px', color: 'rgba(232,234,240,0.35)', cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#7b9cff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,234,240,0.35)'}
        >
          비밀번호를 잊으셨나요?
        </span>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="button" onClick={handleSubmit} disabled={loading}
        style={{
          width: '100%', height: '46px', borderRadius: '10px',
          background: loading ? 'rgba(45,64,142,0.5)' : '#2d408e',
          border: '1px solid rgba(79,112,255,0.35)',
          color: 'white', fontSize: '14px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(45,64,142,0.3)',
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#243370'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(45,64,142,0.5)' } }}
        onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#2d408e'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,64,142,0.3)' } }}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>소셜 계정으로 계속하기</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <SocialButtons />

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(232,234,240,0.35)', marginTop: '24px' }}>
        계정이 없으신가요?{' '}
        <span
          onClick={() => navigate('/register')}
          style={{ color: '#7b9cff', fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a5b8ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#7b9cff'}
        >
          회원가입
        </span>
      </p>
    </div>
  )
}

export default LoginPage