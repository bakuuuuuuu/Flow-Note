import { useState, useEffect, useRef } from 'react'
import { User, Bell, Link, Activity, Camera, Lock, Eye, EyeOff, LogOut, Trash2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import {
  getProfile, updateProfile, updatePassword,
  updateProfileImage, deleteProfileImage, deleteAccount, logout,
} from '../api/authApi'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'profile',  label: '프로필',    icon: User },
  { key: 'activity', label: '활동 내역', icon: Activity },
  { key: 'alarm',    label: '알림',      icon: Bell },
  { key: 'connect',  label: '연동',      icon: Link },
]

const MyPage = () => {
  const { user, setUser, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw]   = useState({ current: false, new: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)

  const [editForm, setEditForm]     = useState({ nickname: '', status_message: '' })
  const [editLoading, setEditLoading] = useState(false)

  const [deleteConfirmPw, setDeleteConfirmPw] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProfile()
        console.log('profile data:', data)
        setProfile(data)
        setEditForm({ nickname: data.nickname, status_message: data.status_message ?? '' })
      } catch {
        toast.error('프로필을 불러오지 못했어요.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('profile_img', file)
    try {
      const { data } = await updateProfileImage(formData)
      setProfile(prev => ({ ...prev, profile_img: data.profile_img }))
      setUser({ ...user, profile_img: data.profile_img })
      toast.success('프로필 이미지가 변경됐어요.')
    } catch {
      toast.error('이미지 업로드에 실패했어요.')
    }
  }

  const handleImageDelete = async () => {
    try {
      await deleteProfileImage()
      setProfile(prev => ({ ...prev, profile_img: null }))
      setUser({ ...user, profile_img: null })
      toast.success('기본 이미지로 변경됐어요.')
    } catch {
      toast.error('이미지 삭제에 실패했어요.')
    }
  }

  const handleEditSave = async () => {
    if (!editForm.nickname.trim()) { toast.error('닉네임을 입력해주세요.'); return }
    setEditLoading(true)
    try {
      const { data } = await updateProfile(editForm)
      setProfile(prev => ({ ...prev, ...data.user }))
      setUser({ ...user, nickname: data.user.nickname })
      toast.success('프로필이 저장됐어요.')
    } catch (err) {
      toast.error(err.response?.data?.message ?? '저장에 실패했어요.')
    } finally {
      setEditLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않아요.'); return
    }
    setPwLoading(true)
    try {
      await updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('비밀번호가 변경됐어요.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? '비밀번호 변경에 실패했어요.')
    } finally {
      setPwLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount({ password: deleteConfirmPw })
      storeLogout()
      toast.success('탈퇴되었습니다.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message ?? '탈퇴에 실패했어요.')
    }
  }

  const handleLogout = async () => {
    try { await logout() } finally {
      storeLogout()
      navigate('/login')
    }
  }

  const profileImgUrl = profile?.profile_img && profile.profile_img !== 'default_profile.png'
    ? `http://localhost:5000${profile.profile_img}`
    : null
  const initial = (profile?.nickname ?? user?.nickname ?? 'U')[0].toUpperCase()

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
      불러오는 중...
    </div>
  )

  return (
    <div className="flex min-h-[calc(100vh-72px)]" style={{ color: 'var(--color-text-primary)' }}>

      {/* ── 좌측 마이페이지 전용 메뉴바 (사이드바 자리) ── */}
      <aside
        className="fixed top-[72px] left-0 h-[calc(100vh-72px)] w-[260px] flex flex-col justify-between py-8 px-4 z-40"
        style={{
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-border-subtle)',
          backdropFilter: 'blur(15px)',
        }}
      >
        {/* 탭 메뉴 */}
        <nav className="flex flex-col gap-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors text-left w-full"
                style={{
                  background: active ? 'rgba(45,64,142,0.08)' : 'transparent',
                  color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-border-subtle)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* 하단 로그아웃 / 회원탈퇴 */}
        <div className="flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors text-left w-full"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = 'var(--color-border-subtle)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={16} />
            로그아웃
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors text-left w-full"
            style={{ color: 'var(--color-status-deadline)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={16} />
            회원 탈퇴
          </button>
        </div>
      </aside>

      {/* ── 우측 콘텐츠 — 마이페이지 메뉴바(200px) 오른쪽부터 시작 ── */}
      <div
        className="flex-1 overflow-y-auto py-12 px-8"
        style={{ marginLeft: '260px' }}
      >
        {/* GitHub 스타일 — 콘텐츠 중앙 정렬 */}
        <div className="max-w-[740px] mx-auto">

          {/* ═══ 프로필 탭 ═══ */}
          {activeTab === 'profile' && (
            <>
              <h2 className="text-[22px] font-bold mb-8" style={{ letterSpacing: '-0.4px' }}>프로필</h2>

              {/* 프로필 이미지 */}
              <div
                className="flex items-center gap-6 mb-8 pb-8 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="relative">
                  {/* 아바타 */}
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
                    style={{ background: profileImgUrl ? 'transparent' : 'var(--color-brand)' }}
                  >
                    {profileImgUrl
                      ? <img src={profileImgUrl} alt="프로필" className="w-full h-full object-cover" />
                      : initial
                    }
                  </div>
                  {/* 카메라 버튼 — 흰 테두리로 아바타와 구분 */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-secondary)',
                      border: '2px solid var(--color-bg)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-brand)'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-surface-2)'
                      e.currentTarget.style.color = 'var(--color-text-secondary)'
                    }}
                  >
                    <Camera size={13} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div>
                  <p className="text-[18px] font-semibold mb-0.5">{profile?.nickname}</p>
                  <p className="text-[13px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    {profile?.email}
                  </p>
                  {profileImgUrl && (
                    <button
                      onClick={handleImageDelete}
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

              {/* 기본 정보 (읽기 전용) */}
              <div className="mb-8">
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                   style={{ color: 'var(--color-text-muted)' }}>
                  기본 정보
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '이름',   value: profile?.name },
                    { label: '이메일', value: profile?.email },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                      <div
                        className="h-11 px-4 rounded-lg flex items-center text-[14px]"
                        style={{
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 계정 설정 */}
              <div className="mb-8 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                   style={{ color: 'var(--color-text-muted)' }}>
                  계정 설정
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>닉네임</p>
                    <input
                      value={editForm.nickname}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                      className="w-full h-11 px-4 rounded-lg text-[14px] outline-none transition-colors"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                    />
                  </div>
                  <div>
                    <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>상태 메시지</p>
                    <input
                      value={editForm.status_message}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status_message: e.target.value }))}
                      placeholder="상태 메시지를 입력하세요 (최대 50자)"
                      maxLength={50}
                      className="w-full h-11 px-4 rounded-lg text-[14px] outline-none transition-colors"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setEditForm({ nickname: profile?.nickname, status_message: profile?.status_message ?? '' })}
                    className="h-10 px-5 rounded-lg text-[13px] font-medium transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={editLoading}
                    className="h-10 px-5 rounded-lg text-[13px] font-medium text-white transition-colors"
                    style={{
                      background: 'var(--color-brand)',
                      opacity: editLoading ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => { if (!editLoading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
                    onMouseLeave={(e) => { if (!editLoading) e.currentTarget.style.background = 'var(--color-brand)' }}
                  >
                    {editLoading ? '저장 중...' : '변경사항 저장'}
                  </button>
                </div>
              </div>

              {/* 비밀번호 변경 */}
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-4 flex items-center gap-1.5"
                   style={{ color: 'var(--color-text-muted)' }}>
                  <Lock size={12} /> 비밀번호 변경
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'currentPassword', label: '현재 비밀번호',   showKey: 'current' },
                    { key: 'newPassword',     label: '새 비밀번호',     showKey: 'new' },
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
                          style={{
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
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
                    onClick={handlePasswordChange}
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
            </>
          )}

          {/* ═══ 활동 내역 탭 ═══ */}
          {activeTab === 'activity' && (
            <>
              <h2 className="text-[22px] font-bold mb-8" style={{ letterSpacing: '-0.4px' }}>활동 내역</h2>
              <div
                className="rounded-xl flex flex-col items-center justify-center py-24"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              >
                <Activity size={36} className="mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
                  활동 내역 기능은 준비 중이에요.
                </p>
              </div>
            </>
          )}

          {/* ═══ 알림 탭 ═══ */}
          {activeTab === 'alarm' && (
            <>
              <h2 className="text-[22px] font-bold mb-8" style={{ letterSpacing: '-0.4px' }}>알림</h2>
              <div
                className="rounded-xl flex flex-col items-center justify-center py-24"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              >
                <Bell size={36} className="mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
                  알림 기능은 준비 중이에요.
                </p>
              </div>
            </>
          )}

          {/* ═══ 연동 탭 ═══ */}
          {activeTab === 'connect' && (
            <>
              <h2 className="text-[22px] font-bold mb-8" style={{ letterSpacing: '-0.4px' }}>연동</h2>
              {[
                { name: 'Google', desc: 'Google 계정으로 간편 로그인' },
                { name: 'GitHub', desc: 'GitHub 계정으로 간편 로그인' },
              ].map(({ name, desc }) => (
                <div
                  key={name}
                  className="flex items-center justify-between px-5 py-4 rounded-xl mb-3"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                >
                  <div>
                    <p className="text-[14px] font-medium">{name}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                  </div>
                  <div
                    className="text-[12px] px-3 py-1.5 rounded-lg"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    준비 중
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>

      {/* ── 회원 탈퇴 확인 모달 ── */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            className="relative rounded-2xl shadow-xl w-full max-w-[400px] mx-4 p-8"
            style={{ background: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              정말 탈퇴할까요?
            </h2>
            <p className="text-[13px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
              탈퇴하면 모든 보드와 카드가 삭제돼요. 이 작업은 되돌릴 수 없어요.
              확인을 위해 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={deleteConfirmPw}
              onChange={(e) => setDeleteConfirmPw(e.target.value)}
              className="w-full h-11 px-4 rounded-lg text-[14px] outline-none mb-5"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-status-deadline)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDeleteModalOpen(false); setDeleteConfirmPw('') }}
                className="h-10 px-5 rounded-lg text-[13px] font-medium"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deleteConfirmPw}
                className="h-10 px-5 rounded-lg text-[13px] font-semibold text-white"
                style={{
                  background: 'var(--color-status-deadline)',
                  opacity: !deleteConfirmPw ? 0.5 : 1,
                }}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default MyPage