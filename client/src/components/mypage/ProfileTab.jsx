import { useRef } from 'react'
import { Camera, Lock, Eye, EyeOff } from 'lucide-react'
import { checkNickname } from '../../api/authApi'

const ProfileTab = ({
  profile,
  profileImgUrl,
  initial,
  editForm,
  setEditForm,
  editLoading,
  nicknameStatus,
  setNicknameStatus,
  pwForm,
  setPwForm,
  showPw,
  setShowPw,
  pwLoading,
  onImageChange,
  onImageDelete,
  onEditSave,
  onPasswordChange,
  onEditCancel,
}) => {
  const fileInputRef = useRef(null)

  return (
    <>
      <h2 className="text-[22px] font-bold mb-8" style={{ letterSpacing: '-0.4px' }}>프로필</h2>

      {/* 프로필 이미지 */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
            style={{ background: profileImgUrl ? 'transparent' : 'var(--color-brand)' }}
          >
            {profileImgUrl
              ? <img src={profileImgUrl} alt="프로필" className="w-full h-full object-cover" />
              : initial
            }
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', border: '2px solid var(--color-bg)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-brand)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            <Camera size={13} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
        </div>
        <div>
          <p className="text-[18px] font-semibold mb-0.5">{profile?.nickname}</p>
          <p className="text-[13px] mb-3" style={{ color: 'var(--color-text-muted)' }}>{profile?.email}</p>
          {profileImgUrl && (
            <button
              onClick={onImageDelete}
              className="text-[12px] transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-status-deadline)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              기본 이미지로 변경
            </button>
          )}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--color-text-muted)' }}>기본 정보</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '이름',   value: profile?.name },
            { label: '이메일', value: profile?.email },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <div className="h-11 px-4 rounded-lg flex items-center text-[14px]" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 계정 설정 */}
      <div className="mb-8 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-[12px] font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--color-text-muted)' }}>계정 설정</p>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>닉네임</p>
            <div className="flex gap-2">
              <input
                value={editForm.nickname}
                onChange={(e) => { setEditForm(prev => ({ ...prev, nickname: e.target.value })); setNicknameStatus(null) }}
                className="flex-1 h-11 px-4 rounded-lg text-[14px] outline-none transition-colors"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
              <button
                type="button"
                onClick={async () => {
                  if (!editForm.nickname.trim()) return
                  setNicknameStatus('checking')
                  try {
                    await checkNickname(editForm.nickname.trim())
                    setNicknameStatus('ok')
                  } catch {
                    setNicknameStatus('dup')
                  }
                }}
                disabled={nicknameStatus === 'checking'}
                className="h-11 px-4 rounded-lg text-[13px] font-semibold transition-colors flex-shrink-0"
                style={{ background: 'rgba(45,64,142,0.15)', border: '1px solid rgba(79,112,255,0.3)', color: 'var(--color-brand)', cursor: nicknameStatus === 'checking' ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,64,142,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(45,64,142,0.15)'}
              >
                {nicknameStatus === 'checking' ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {nicknameStatus === 'ok'  && <p className="text-[11px] mt-1.5" style={{ color: '#34d399' }}>사용 가능한 닉네임이에요.</p>}
            {nicknameStatus === 'dup' && <p className="text-[11px] mt-1.5" style={{ color: '#f87171' }}>이미 사용 중인 닉네임이에요.</p>}
          </div>
          <div>
            <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>상태 메시지</p>
            <input
              value={editForm.status_message}
              onChange={(e) => setEditForm(prev => ({ ...prev, status_message: e.target.value }))}
              placeholder="상태 메시지를 입력하세요 (최대 50자)"
              maxLength={50}
              className="w-full h-11 px-4 rounded-lg text-[14px] outline-none transition-colors"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onEditCancel}
            className="h-10 px-5 rounded-lg text-[13px] font-medium transition-colors"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
          >
            취소
          </button>
          <button
            onClick={onEditSave}
            disabled={editLoading}
            className="h-10 px-5 rounded-lg text-[13px] font-medium text-white transition-colors"
            style={{ background: 'var(--color-brand)', opacity: editLoading ? 0.6 : 1 }}
            onMouseEnter={(e) => { if (!editLoading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
            onMouseLeave={(e) => { if (!editLoading) e.currentTarget.style.background = 'var(--color-brand)' }}
          >
            {editLoading ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 - 소셜 유저 숨김 */}
      {profile?.provider === 'local' && (
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide mb-4 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <Lock size={12} /> 비밀번호 변경
          </p>
          <div className="flex flex-col gap-3">
            {[
              { key: 'currentPassword', label: '현재 비밀번호', showKey: 'current' },
              { key: 'newPassword',     label: '새 비밀번호',   showKey: 'new' },
              { key: 'confirmPassword', label: '새 비밀번호 확인', showKey: 'confirm' },
            ].map(({ key, label, showKey }) => (
              <div key={key}>
                <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                <div className="relative">
                  <input
                    type={showPw[showKey] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full h-11 px-4 pr-11 rounded-lg text-[14px] outline-none transition-colors"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {showPw[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={onPasswordChange}
              disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
              className="h-10 px-5 rounded-lg text-[13px] font-medium text-white transition-colors"
              style={{
                background: 'var(--color-brand)',
                opacity: (pwLoading || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!pwLoading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
              onMouseLeave={(e) => { if (!pwLoading) e.currentTarget.style.background = 'var(--color-brand)' }}
            >
              {pwLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfileTab