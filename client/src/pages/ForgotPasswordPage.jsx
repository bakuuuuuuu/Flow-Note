import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/authApi'

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
    setForm((prev) => ({ ...prev, phone: v }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
          Forgot Password?
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
          가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>

        {/* ── 입력칸 묶음 ── */}
        <div className="flex flex-col w-full" style={{ gap: 'clamp(10px, 1.1vw, 16px)' }}>
          <input
            name="email" type="email" placeholder="이메일 주소"
            value={form.email} onChange={handleChange}
            className="auth-input"
          />
          <input
            name="name" type="text" placeholder="이름"
            value={form.name} onChange={handleChange}
            className="auth-input"
          />
          <input
            name="phone" type="text" placeholder="전화번호 (010-0000-0000)"
            value={form.phone} onChange={handlePhone} maxLength={13}
            className="auth-input"
          />
        </div>

        {/* 메시지 / 에러 */}
        {message && <p className="text-green-400 text-sm w-full" style={{ marginTop: '8px' }}>{message}</p>}
        {error   && <p className="text-red-400   text-sm w-full" style={{ marginTop: '8px' }}>{error}</p>}

        {/* ── 전송 버튼 ── */}
        <button
          type="button" onClick={handleSubmit} disabled={loading}
          className="auth-btn"
          style={{ marginTop: 'clamp(20px, 2.2vw, 32px)' }}
        >
          {loading ? '발송 중...' : '비밀번호 재설정 메일 보내기'}
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

export default ForgotPasswordPage