import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import { inputStyle, labelStyle, onFocus, onBlur, EyeBtn } from '../utils/authStyles.jsx'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', passwordConfirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      await resetPassword(token, { password: form.password })
      setMessage('비밀번호가 성공적으로 변경되었습니다.')
      setTimeout(() => navigate('/login'), 1500)
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
          새 비밀번호 설정
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(232,234,240,0.4)', lineHeight: 1.6 }}>
          보안을 위해 새로운 비밀번호를 입력해주세요.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>새 비밀번호</label>
          <div style={{ position: 'relative' }}>
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="영문+숫자+특수문자, 8자 이상" value={form.password} onChange={handleChange} style={{ ...inputStyle, paddingRight: '44px' }} onFocus={onFocus} onBlur={onBlur} />
            <EyeBtn show={showPassword} onToggle={() => setShowPassword(v => !v)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>비밀번호 확인</label>
          <div style={{ position: 'relative' }}>
            <input name="passwordConfirm" type={showPasswordConfirm ? 'text' : 'password'} placeholder="비밀번호 재입력" value={form.passwordConfirm} onChange={handleChange} style={{ ...inputStyle, paddingRight: '44px' }} onFocus={onFocus} onBlur={onBlur} />
            <EyeBtn show={showPasswordConfirm} onToggle={() => setShowPasswordConfirm(v => !v)} />
          </div>
          {form.passwordConfirm && form.password !== form.passwordConfirm && (
            <p style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>비밀번호가 일치하지 않아요.</p>
          )}
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
        {loading ? '변경 중...' : message ? '변경 완료 ✓' : '비밀번호 변경하기'}
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

export default ResetPasswordPage