import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, checkNickname } from '../api/authApi'
import useAuthStore from '../store/authStore'
import SocialButtons from '../components/common/SocialButtons'
import toast from 'react-hot-toast'
import TermsModal from '../components/common/TermsModal'
import { inputStyle, labelStyle, onFocus, onBlur, EyeBtn } from '../utils/authStyles.jsx'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', nickname: '', gender: '',
    birthdate: '', email: '', phone: '',
    password: '', passwordConfirm: '',
  })
  const [nicknameStatus, setNicknameStatus] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'nickname') setNicknameStatus(null)
  }
  const handleGender = (val) => setForm(prev => ({ ...prev, gender: val }))

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
    setForm(prev => ({ ...prev, birthdate: v }))
  }

  const handlePhone = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + '-' + v.slice(3)
    else if (v.length > 7) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11)
    setForm(prev => ({ ...prev, phone: v }))
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!form.name.trim()) { setError('이름을 입력해주세요.'); return }
      if (!form.nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
      if (nicknameStatus !== 'ok') { setError('닉네임 중복 확인을 해주세요.'); return }
      if (!form.gender) { setError('성별을 선택해주세요.'); return }
    }
    if (step === 2) {
      if (!form.birthdate.trim()) { setError('생년월일을 입력해주세요.'); return }
      if (!form.email.trim()) { setError('이메일을 입력해주세요.'); return }
      if (!form.phone.trim()) { setError('전화번호를 입력해주세요.'); return }
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setError('')
    if (!agreed) { setError('이용약관에 동의해주세요.'); return }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      const { passwordConfirm: _, ...submitData } = form
      submitData.agreed = agreed
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

  const STEPS = ['기본 정보', '연락처', '보안']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: 'clamp(20px, 1.8vw, 26px)', fontWeight: 800, color: '#e8eaf0', letterSpacing: '-0.04em', marginBottom: '6px', lineHeight: 1.2 }}>
          Flow-Note 시작하기
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(232,234,240,0.4)' }}>
          계정을 만들어 모든 기능을 사용해보세요.
        </p>
      </div>

      {/* 스텝 인디케이터 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        {STEPS.map((label, i) => {
          const num = i + 1
          const active = step === num
          const done = step > num
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: done ? '#2d408e' : active ? 'rgba(45,64,142,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${done || active ? 'rgba(79,112,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {done
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7b9cff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize: '11px', fontWeight: 700, color: active ? '#7b9cff' : 'rgba(232,234,240,0.3)' }}>{num}</span>
                  }
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: active ? '#7b9cff' : done ? 'rgba(232,234,240,0.5)' : 'rgba(232,234,240,0.25)', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '1px', background: done ? 'rgba(79,112,255,0.4)' : 'rgba(255,255,255,0.08)', margin: '0 10px', marginBottom: '20px', transition: 'background 0.2s' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* 스텝 콘텐츠 */}
      <div style={{ minHeight: '260px' }}>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>이름</label>
              <input name="name" type="text" placeholder="홍길동" value={form.name} onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>닉네임</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input name="nickname" type="text" placeholder="사용할 닉네임" value={form.nickname} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} onFocus={onFocus} onBlur={onBlur} />
                <button
                  type="button" onClick={handleCheckNickname}
                  disabled={nicknameStatus === 'checking'}
                  style={{
                    height: '46px', padding: '0 14px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(45,64,142,0.2)', border: '1px solid rgba(79,112,255,0.3)',
                    color: '#7b9cff', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,64,142,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(45,64,142,0.2)'}
                >
                  중복 확인
                </button>
              </div>
              {nicknameStatus === 'ok'  && <p style={{ fontSize: '11px', color: '#34d399', marginTop: '6px' }}>사용 가능한 닉네임이에요.</p>}
              {nicknameStatus === 'dup' && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>이미 사용 중인 닉네임이에요.</p>}
            </div>
            <div>
              <label style={labelStyle}>성별</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['남성', '여성'].map(val => (
                  <button key={val} type="button" onClick={() => handleGender(val)} style={{
                    flex: 1, height: '46px', borderRadius: '10px',
                    background: form.gender === val ? 'rgba(45,64,142,0.35)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${form.gender === val ? 'rgba(79,112,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: form.gender === val ? '#a5b8ff' : 'rgba(232,234,240,0.45)',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  }}>
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>생년월일</label>
              <input name="birthdate" type="text" placeholder="YYYY.MM.DD" value={form.birthdate} onChange={handleBirthdate} maxLength={10} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>이메일</label>
              <input name="email" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>전화번호</label>
              <input name="phone" type="text" placeholder="010-0000-0000" value={form.phone} onChange={handlePhone} maxLength={13} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>비밀번호</label>
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#4f70ff', flexShrink: 0 }}
              />
              <span style={{ fontSize: '12px', color: 'rgba(232,234,240,0.45)' }}>
                <span
                  onClick={e => { e.preventDefault(); setShowTerms(true) }}
                  style={{ color: '#7b9cff', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                >
                  이용약관 및 개인정보처리방침
                </span>
                에 동의합니다.
              </span>
            </label>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginTop: '8px' }}>
          <p style={{ fontSize: '12px', color: '#f87171', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        {step > 1 && (
          <button
            type="button" onClick={() => { setStep(s => s - 1); setError('') }}
            style={{
              height: '46px', padding: '0 20px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(232,234,240,0.6)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            ← 이전
          </button>
        )}
        <button
          type="button" onClick={step < 3 ? handleNext : handleSubmit} disabled={loading}
          style={{
            flex: 1, height: '46px', borderRadius: '10px',
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
          {loading ? '처리 중...' : step < 3 ? '다음 →' : '시작하기'}
        </button>
      </div>

      {step === 1 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>소셜 계정으로 계속하기</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <SocialButtons />
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(232,234,240,0.35)', marginTop: '16px' }}>
            이미 계정이 있으신가요?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#7b9cff', fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a5b8ff'}
              onMouseLeave={e => e.currentTarget.style.color = '#7b9cff'}
            >
              로그인
            </span>
          </p>
        </>
      )}
    </div>
  )
}

export default RegisterPage