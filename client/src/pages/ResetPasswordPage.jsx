import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import EyeToggle from '../components/common/EyeToggle'

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
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
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
    <>
      <div className="flex flex-col w-full items-center">

        {/* ── 타이틀 ── */}
        <h1
          className="text-white font-bold text-center w-full"
          style={{
            fontSize: 'clamp(24px, 2.5vw, 36px)',
            letterSpacing: '-0.8px',
            marginBottom: '6px',
          }}
        >
          Reset Password
        </h1>
        <p
          className="text-center w-full"
          style={{
            fontSize: 'clamp(12px, 0.9vw, 14px)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 'clamp(20px, 2.5vw, 32px)',
          }}
        >
          보안을 위해 새로운 비밀번호를 입력해 주세요.
        </p>

        {/* ── 입력칸 묶음 ── */}
        <div className="flex flex-col w-full" style={{ gap: 'clamp(10px, 1.1vw, 16px)' }}>

          {/* 새 비밀번호 */}
          <div style={{ position: 'relative' }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="새 비밀번호 입력"
              value={form.password}
              onChange={handleChange}
              className="auth-input" style={{ paddingRight: '44px' }}
            />
            <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>

          {/* 비밀번호 확인 */}
          <div style={{ position: 'relative' }}>
            <input
              name="passwordConfirm"
              type={showPasswordConfirm ? 'text' : 'password'}
              placeholder="비밀번호 확인"
              value={form.passwordConfirm}
              onChange={handleChange}
              className="auth-input" style={{ paddingRight: '44px' }}
            />
            <EyeToggle show={showPasswordConfirm} onToggle={() => setShowPasswordConfirm((v) => !v)} />
          </div>
          {form.passwordConfirm && form.password !== form.passwordConfirm && (
            <p className="text-red-400 text-xs" style={{ marginTop: '-4px' }}>비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        {/* 메시지 / 에러 */}
        {message && <p className="text-green-400 text-sm w-full" style={{ marginTop: '8px' }}>{message}</p>}
        {error   && <p className="text-red-400   text-sm w-full" style={{ marginTop: '8px' }}>{error}</p>}

        {/* ── 변경 버튼 ── */}
        <button
          type="button" onClick={handleSubmit} disabled={loading}
          className="auth-btn"
          style={{ marginTop: 'clamp(20px, 2.2vw, 32px)' }}
        >
          {loading ? '변경 중...' : '비밀번호 변경하기'}
        </button>

        {/* ── 로그인으로 돌아가기 ── */}
        <p className="text-center" style={{
          fontSize: 'clamp(12px, 1vw, 14px)',
          color: 'var(--color-dark-text-secondary)',
          marginTop: 'clamp(16px, 1.8vw, 24px)',
        }}>
          <span
            className="underline cursor-pointer font-semibold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-auth-link)' }}
            onClick={() => navigate('/login')}
          >
            로그인 화면으로 돌아가기
          </span>
        </p>

      </div>
    </>
  )
}

export default ResetPasswordPage