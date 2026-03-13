import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import useAuthStore from '../store/authStore'
import SocialButtons from '../components/common/SocialButtons'


const LoginPage = () => {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(form)
      setAccessToken(data.accessToken)
      setUser(data.user)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col w-full items-center">

        {/* ── Login 타이틀 ── */}
        <h1
          className="text-white font-bold text-center w-full"
          style={{
            fontSize: 'clamp(28px, 2.8vw, 40px)',
            letterSpacing: '-0.8px',
            marginBottom: 'clamp(24px, 2.8vw, 40px)',
          }}
        >
          Login
        </h1>

        {/* ── 입력칸 묶음 ── */}
        <div className="flex flex-col w-full" style={{ gap: 'clamp(10px, 1.1vw, 16px)' }}>
          <input
            name="email"
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="auth-input"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            className="auth-input"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-400 text-sm w-full" style={{ marginTop: '8px' }}>
            {error}
          </p>
        )}

        {/* ── 로그인 버튼 ── */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="auth-btn"
          style={{ fontSize: 'clamp(15px, 1.25vw, 18px)', letterSpacing: '0.1em', marginTop: 'clamp(20px, 2.2vw, 32px)' }}
        >
          {loading ? '로그인 중...' : '로 그 인'}
        </button>

        {/* ── 구분선 ── */}
        <p
          className="text-center"
          style={{
            fontSize: 'clamp(11px, 0.85vw, 12px)',
            color: 'var(--color-dark-text-muted)',
            marginTop: 'clamp(20px, 2.2vw, 32px)',
            marginBottom: 'clamp(16px, 1.7vw, 24px)',
          }}
        >
          --- 또는 ---
        </p>

        {/* ── 소셜 로그인 ── */}
        <SocialButtons />

        {/* ── 하단 링크 ── */}
        <p
          className="text-center"
          style={{
            fontSize: 'clamp(12px, 1vw, 14px)',
            color: 'var(--color-dark-text-secondary)',
            marginTop: 'clamp(20px, 2.2vw, 32px)',
          }}
        >
          계정이 없으신가요?{' '}
          <span
            className="underline cursor-pointer font-semibold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-auth-link)' }}
            onClick={() => navigate('/register')}
          >
            회원가입
          </span>
          {' '}
          <span
            className="underline cursor-pointer font-semibold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-auth-link)' }}
            onClick={() => navigate('/forgot-password')}
          >
            비밀번호 찾기
          </span>
        </p>

      </div>
    </>
  )
}

export default LoginPage