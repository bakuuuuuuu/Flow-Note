import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/authApi'
import { inputStyle, labelStyle, onFocus, onBlur } from '../utils/authStyles.jsx'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', name: '', phone: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhone = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + '-' + v.slice(3)
    else if (v.length > 7) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11)
    setForm(prev => ({ ...prev, phone: v }))
  }

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await forgotPassword(form)
      setMessage('재설정 링크가 이메일로 발송되었습니다.')
    } catch (err) {
      setError(err.response?.data?.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: 'clamp(22px, 2vw, 28px)', fontWeight: 800, color: '#e8eaf0', letterSpacing: '-0.04em', marginBottom: '8px', lineHeight: 1.2 }}>
          비밀번호를 잊으셨나요?
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(232,234,240,0.4)', lineHeight: 1.6 }}>
          가입 정보를 입력하시면 재설정 링크를 보내드려요.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>이메일</label>
          <input name="email" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div>
          <label style={labelStyle}>이름</label>
          <input name="name" type="text" placeholder="홍길동" value={form.name} onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div>
          <label style={labelStyle}>전화번호</label>
          <input name="phone" type="text" placeholder="010-0000-0000" value={form.phone} onChange={handlePhone} maxLength={13} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
      </div>

      {message && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#34d399', margin: 0 }}>{message}</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="button" onClick={handleSubmit} disabled={loading || !!message}
        style={{
          width: '100%', height: '46px', borderRadius: '10px',
          background: loading || message ? 'rgba(45,64,142,0.5)' : '#2d408e',
          border: '1px solid rgba(79,112,255,0.35)',
          color: 'white', fontSize: '14px', fontWeight: 700,
          cursor: loading || message ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(45,64,142,0.3)',
        }}
        onMouseEnter={e => { if (!loading && !message) { e.currentTarget.style.background = '#243370'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(45,64,142,0.5)' } }}
        onMouseLeave={e => { if (!loading && !message) { e.currentTarget.style.background = '#2d408e'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,64,142,0.3)' } }}
      >
        {loading ? '발송 중...' : message ? '발송 완료 ✓' : '재설정 메일 보내기'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(232,234,240,0.35)', marginTop: '24px' }}>
        <span
          onClick={() => navigate('/login')}
          style={{ color: '#7b9cff', fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a5b8ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#7b9cff'}
        >
          ← 로그인으로 돌아가기
        </span>
      </p>
    </div>
  )
}

export default ForgotPasswordPage