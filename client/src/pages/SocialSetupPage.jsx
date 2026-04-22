import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { socialSetup } from '../api/authApi'
import toast from 'react-hot-toast'
import { checkNickname } from '../api/authApi'

const SocialSetupPage = () => {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({ nickname: '', gender: '', birthdate: '', phone: '' })
  const [nicknameStatus, setNicknameStatus] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'nickname') setNicknameStatus(null)
  }

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

  const handleSubmit = async () => {
    setError('')
    if (!form.nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    if (nicknameStatus !== 'ok') { setError('닉네임 중복 확인을 해주세요.'); return }
    if (!form.gender) { setError('성별을 선택해주세요.'); return }
    if (!form.birthdate.trim()) { setError('생년월일을 입력해주세요.'); return }
    if (!form.phone.trim()) { setError('전화번호를 입력해주세요.'); return }

    setLoading(true)
    try {
      const { data } = await socialSetup(form)
      setUser(data.user)
      toast.success('프로필 설정이 완료되었습니다 🎉')
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', height: '46px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#e8eaf0', fontSize: '14px', padding: '0 14px',
    outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: 'rgba(232,234,240,0.4)', letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: '8px',
  }

  const onFocus = e => e.target.style.borderColor = 'rgba(79,112,255,0.6)'
  const onBlur  = e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', fontFamily: 'Pretendard, Noto Sans KR, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px', padding: '0 24px' }}>

        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Flow-Note" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#e8eaf0' }}>Flow-Note</span>
        </div>

        {/* 타이틀 */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#e8eaf0', letterSpacing: '-0.04em', marginBottom: '8px' }}>
            추가 정보 입력
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(232,234,240,0.4)', lineHeight: 1.6 }}>
            서비스 이용을 위해 몇 가지 정보가 필요해요.
          </p>
        </div>

        {/* 입력 폼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 닉네임 */}
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

          {/* 성별 */}
          <div>
            <label style={labelStyle}>성별</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['남성', '여성'].map(val => (
                <button key={val} type="button" onClick={() => setForm(p => ({ ...p, gender: val }))} style={{
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

          {/* 생년월일 */}
          <div>
            <label style={labelStyle}>생년월일</label>
            <input name="birthdate" type="text" placeholder="YYYY.MM.DD" value={form.birthdate} onChange={handleBirthdate} maxLength={10} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* 전화번호 */}
          <div>
            <label style={labelStyle}>전화번호</label>
            <input name="phone" type="text" placeholder="010-0000-0000" value={form.phone} onChange={handlePhone} maxLength={13} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginTop: '16px' }}>
            <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* 완료 버튼 */}
        <button
          type="button" onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', height: '46px', borderRadius: '10px', marginTop: '24px',
            background: loading ? 'rgba(45,64,142,0.5)' : '#2d408e',
            border: '1px solid rgba(79,112,255,0.35)',
            color: 'white', fontSize: '14px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(45,64,142,0.3)',
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#243370' } }}
          onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#2d408e' } }}
        >
          {loading ? '저장 중...' : '시작하기'}
        </button>
      </div>
    </div>
  )
}

export default SocialSetupPage