import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, checkNickname } from '../api/authApi'
import useAuthStore from '../store/authStore'
import SocialButtons from '../components/common/SocialButtons'
import EyeToggle from '../components/common/EyeToggle'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()

  const [form, setForm] = useState({
    name: '', nickname: '', gender: '',
    birthdate: '', email: '',
    password: '', passwordConfirm: '', phone: '',
  })
  const [nicknameStatus, setNicknameStatus] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'nickname') setNicknameStatus(null)
  }
  const handleGender = (val) => setForm((prev) => ({ ...prev, gender: val }))

  const handleCheckNickname = async () => {
    if (!form.nickname.trim()) return
    setNicknameStatus('checking')
    try {
      await checkNickname(form.nickname.trim())
      setNicknameStatus('ok')
    } catch {
      setNicknameStatus('dup')
    }
  }

  const handleBirthdate = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 4) v = v.slice(0, 4) + '.' + v.slice(4)
    if (v.length > 7) v = v.slice(0, 7) + '.' + v.slice(7)
    if (v.length > 10) v = v.slice(0, 10)
    setForm((prev) => ({ ...prev, birthdate: v }))
  }

  const handlePhone = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + '-' + v.slice(3)
    else if (v.length > 7) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11)
    setForm((prev) => ({ ...prev, phone: v }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!agreed) { setError('이용약관에 동의해주세요.'); return }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      const { passwordConfirm: _, ...submitData } = form
      const { data } = await register(submitData)
      setAccessToken(data.accessToken)
      setUser(data.user)
      toast.success('회원가입이 완료되었습니다 🎉')
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.')
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
          style={{ fontSize: 'clamp(24px, 2.5vw, 36px)', letterSpacing: '-0.8px', marginBottom: '6px' }}
        >
          Create Account
        </h1>
        <p
          className="text-center w-full"
          style={{
            fontSize: 'clamp(12px, 0.9vw, 14px)',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 'clamp(12px, 1.5vw, 20px)',
          }}
        >
          Flow-Note의 모든 기능을 시작해보세요.
        </p>

        {/* ── 스크롤 입력 영역 ── */}
        <div
          className="input-scroll w-full"
          style={{
            height: 'clamp(260px, 34vw, 310px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 0.9vw, 12px)',
            paddingRight: '6px',
          }}
        >
          {/* 이름 */}
          <input
            name="name" type="text" placeholder="이름"
            value={form.name} onChange={handleChange}
            className="auth-input"
          />

          {/* 닉네임 + 중복확인 */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <input
              name="nickname" type="text" placeholder="닉네임"
              value={form.nickname} onChange={handleChange}
              className="auth-input" style={{ flex: 1 }}
            />
            <button
              type="button" onClick={handleCheckNickname}
              disabled={nicknameStatus === 'checking'}
              className="auth-input"
              style={{ width: 'auto', fontSize: 'clamp(12px, 0.85vw, 14px)', padding: '0 clamp(10px, 1vw, 16px)', whiteSpace: 'nowrap', cursor: 'pointer' }}
            >중복 확인</button>
          </div>
          {nicknameStatus === 'ok'  && <p className="text-green-400 text-xs" style={{ marginTop: '-4px', flexShrink: 0 }}>사용 가능한 닉네임입니다.</p>}
          {nicknameStatus === 'dup' && <p className="text-red-400 text-xs"   style={{ marginTop: '-4px', flexShrink: 0 }}>이미 사용 중인 닉네임입니다.</p>}

          {/* 성별 */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {[{ val: '남성', label: '남성' }, { val: '여성', label: '여성' }].map(({ val, label }) => (
              <button
                key={val} type="button" onClick={() => handleGender(val)}
                className={`gender-btn ${form.gender === val ? 'active' : ''}`}
              >{label}</button>
            ))}
          </div>

          {/* 생년월일 */}
          <input
            name="birthdate" type="text" placeholder="YYYY.MM.DD"
            value={form.birthdate} onChange={handleBirthdate} maxLength={10}
            className="auth-input"
          />

          {/* 이메일 */}
          <input
            name="email" type="email" placeholder="FlowNote@gmail.com"
            value={form.email} onChange={handleChange}
            className="auth-input"
          />

          {/* 비밀번호 — 눈 아이콘 토글 */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호 (영문+숫자+특수문자, 8자 이상)"
              value={form.password}
              onChange={handleChange}
              className="auth-input" style={{ paddingRight: '44px' }}
            />
            <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>

          {/* 비밀번호 확인 — 눈 아이콘 토글 */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
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
            <p className="text-red-400 text-xs" style={{ marginTop: '-4px', flexShrink: 0 }}>비밀번호가 일치하지 않습니다.</p>
          )}

          {/* 전화번호 — 엔터 시 제출 */}
          <input
            name="phone" type="text" placeholder="전화번호 (010-0000-0000)"
            value={form.phone} onChange={handlePhone} maxLength={13}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            className="auth-input"
          />
        </div>

        {/* ── 이용약관 ── */}
        <label
          className="flex items-center cursor-pointer w-full"
          style={{ gap: '8px', marginTop: 'clamp(10px, 1.2vw, 16px)' }}
        >
          <input
            type="checkbox" checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 cursor-pointer accent-blue-400"
          />
          <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)', color: 'var(--color-dark-text-secondary)' }}>
            이용약관 및 개인정보 처리방침에 동의합니다.
          </span>
        </label>

        {/* 에러 */}
        {error && (
          <p className="text-red-400 text-sm w-full" style={{ marginTop: '6px' }}>{error}</p>
        )}

        {/* ── 시작하기 버튼 ── */}
        <button
          type="button" onClick={handleSubmit} disabled={loading}
          className="auth-btn"
          style={{ fontSize: 'clamp(15px, 1.25vw, 18px)', letterSpacing: '0.1em', marginTop: 'clamp(10px, 1.2vw, 16px)' }}
        >
          {loading ? '처리 중...' : '시 작 하 기'}
        </button>

        {/* ── 구분선 ── */}
        <p
          className="text-center"
          style={{
            fontSize: 'clamp(11px, 0.85vw, 12px)',
            color: 'var(--color-dark-text-muted)',
            marginTop: 'clamp(12px, 1.5vw, 20px)',
            marginBottom: 'clamp(10px, 1.2vw, 16px)',
          }}
        >
          --- 또는 소셜 계정으로 가입 ---
        </p>

        {/* ── 소셜 버튼 ── */}
        <SocialButtons />

        {/* ── 로그인 링크 ── */}
        <p
          className="text-center"
          style={{
            fontSize: 'clamp(12px, 1vw, 14px)',
            color: 'var(--color-dark-text-secondary)',
            marginTop: 'clamp(12px, 1.5vw, 20px)',
          }}
        >
          이미 계정이 있으신가요?{' '}
          <span
            className="underline cursor-pointer font-semibold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-auth-link)' }}
            onClick={() => navigate('/login')}
          >
            로그인
          </span>
        </p>

      </div>
    </>
  )
}

export default RegisterPage