import { useState, useEffect, useRef } from 'react'
import { User, Bell, Link, Camera, Lock, Eye, EyeOff, LogOut, Trash2, Check, ChevronRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import {
  getProfile, updateProfile, updatePassword,
  updateProfileImage, deleteProfileImage, deleteAccount, logout,
} from '../api/authApi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useNotificationStore from '../store/notificationStore'

const TABS = [
  { key: 'profile',  label: '프로필',    icon: User },
  { key: 'alarm',    label: '알림',      icon: Bell },
  { key: 'connect',  label: '연동',      icon: Link },
]

const CATEGORY_MAP = {
  DEADLINE: { label: '마감 임박', color: 'var(--color-status-deadline)' },
  UPDATE:   { label: '업데이트', color: 'var(--color-brand)' },
  SYSTEM:   { label: '시스템',   color: 'var(--color-text-muted)' },
  COMMENT:  { label: '댓글',     color: 'var(--color-status-doing)' },
}

const FILTER_TABS = [
  { key: 'all',      label: '전체' },
  { key: 'DEADLINE', label: '마감 임박' },
  { key: 'UPDATE',   label: '업데이트' },
  { key: 'SYSTEM',   label: '시스템' },
]

const groupByDate = (list) => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek  = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())
  const groups = { today: [], week: [], older: [] }
  list.forEach(n => {
    const d = new Date(n.createdAt)
    if (d >= startOfToday)     groups.today.push(n)
    else if (d >= startOfWeek) groups.week.push(n)
    else                       groups.older.push(n)
  })
  return groups
}

const MyPage = () => {
  const { user, setUser, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)

  const [editForm, setEditForm] = useState({ nickname: '', status_message: '' })
  const [editLoading, setEditLoading] = useState(false)

  const [deleteConfirmPw, setDeleteConfirmPw] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [notiFilter, setNotiFilter] = useState('all')

  const {
    notifications,
    unreadCount,
    loading: notiLoading,
    fetchNotifications,
    readOne,
    readAll,
    removeOne,
  } = useNotificationStore()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  useEffect(() => {
    if (activeTab === 'alarm') fetchNotifications()
  }, [activeTab])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProfile()
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

  const handleNotiNavigate = (noti) => {
    readOne(noti._id)
    const url = noti.link_url
    const isValid = url && (
      url.startsWith('/home') ||
      url.startsWith('/board/') ||
      url.startsWith('/mypage') ||
      url.startsWith('/priority') ||
      url.startsWith('/starred')
    )
    navigate(isValid ? url : '/home')
  }

  const profileImgUrl = profile?.profile_img && profile.profile_img !== 'default_profile.png'
    ? `http://localhost:5000${profile.profile_img}`
    : null
  const initial = (profile?.nickname ?? user?.nickname ?? 'U')[0].toUpperCase()

  // 알림 필터링 & 그룹핑
  const filteredNotis = notiFilter === 'all'
    ? notifications
    : notifications.filter(n => n.category === notiFilter)
  const groups = groupByDate(filteredNotis)
  const groupLabels = { today: '오늘', week: '이번 주', older: '이전' }

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
      불러오는 중...
    </div>
  )

  // ── 알림 아이템 컴포넌트 ──
  const NotiItem = ({ noti }) => {
    const cat = CATEGORY_MAP[noti.category] ?? { label: noti.category, color: 'var(--color-text-muted)' }
    return (
      <div
        className="relative flex items-start gap-4 px-5 py-4 rounded-xl transition-all overflow-hidden"
        style={{
          background: noti.is_read ? 'var(--color-surface-2)' : 'rgba(45,64,142,0.05)',
          border: `1px solid ${noti.is_read ? 'var(--color-border)' : 'rgba(45,64,142,0.18)'}`,
        }}
      >
        {/* 좌측 컬러 바 */}
        {!noti.is_read && (
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
            style={{ background: cat.color }}
          />
        )}

        {/* 읽음 여부 점 */}
        <div className="mt-1 shrink-0 ml-1">
          <div
            className="w-2 h-2 rounded-full transition-colors"
            style={{ background: noti.is_read ? 'var(--color-border)' : cat.color }}
          />
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${cat.color}18`, color: cat.color }}
            >
              {cat.label}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {new Date(noti.createdAt).toLocaleDateString('ko-KR', {
                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <p
            className="text-[14px] font-semibold mb-0.5"
            style={{ color: noti.is_read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
          >
            {noti.title}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            {noti.content}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-1 shrink-0">
          {noti.link_url && (
            <button
              onClick={() => handleNotiNavigate(noti)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-brand)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
              title="바로가기"
            >
              <ChevronRight size={16} />
            </button>
          )}
          {!noti.is_read && (
            <button
              onClick={() => readOne(noti._id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-brand)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
              title="읽음 표시"
            >
              <Check size={15} />
            </button>
          )}
          <button
            onClick={() => removeOne(noti._id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--color-status-deadline)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
            title="삭제"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)]" style={{ color: 'var(--color-text-primary)' }}>

      {/* ── 좌측 마이페이지 전용 메뉴바 ── */}
      <aside
        className="fixed top-[72px] left-0 h-[calc(100vh-72px)] w-[260px] flex flex-col justify-between py-8 px-4 z-40"
        style={{
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-border-subtle)',
          backdropFilter: 'blur(15px)',
        }}
      >
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
                <span className="flex-1">{label}</span>
                {key === 'alarm' && unreadCount > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: 'var(--color-status-deadline)' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

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

      {/* ── 우측 콘텐츠 ── */}
      <div className="flex-1 overflow-y-auto py-12 px-8" style={{ marginLeft: '260px' }}>
        <div className="max-w-[740px] mx-auto">

          {/* ═══ 프로필 탭 ═══ */}
          {activeTab === 'profile' && (
            <>
              <h2 className="text-[22px] font-bold mb-8" style={{ letterSpacing: '-0.4px' }}>프로필</h2>

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
                    style={{
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-secondary)',
                      border: '2px solid var(--color-bg)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-brand)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                  >
                    <Camera size={13} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
                <div>
                  <p className="text-[18px] font-semibold mb-0.5">{profile?.nickname}</p>
                  <p className="text-[13px] mb-3" style={{ color: 'var(--color-text-muted)' }}>{profile?.email}</p>
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

              <div className="mb-8">
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--color-text-muted)' }}>
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
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  계정 설정
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[12px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>닉네임</p>
                    <input
                      value={editForm.nickname}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                      className="w-full h-11 px-4 rounded-lg text-[14px] outline-none transition-colors"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
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
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setEditForm({ nickname: profile?.nickname, status_message: profile?.status_message ?? '' })}
                    className="h-10 px-5 rounded-lg text-[13px] font-medium transition-colors"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEditSave}
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

            {profile?.provider === 'local' && (
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-4 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <Lock size={12} /> 비밀번호 변경
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'currentPassword', label: '현재 비밀번호',    showKey: 'current' },
                    { key: 'newPassword',     label: '새 비밀번호',      showKey: 'new' },
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
              )}
            </>
          )}

          {/* ═══ 알림 탭 ═══ */}
          {activeTab === 'alarm' && (
            <>
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-bold flex items-center gap-2" style={{ letterSpacing: '-0.4px' }}>
                  알림
                  {unreadCount > 0 && (
                    <span
                      className="text-[13px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'var(--color-status-deadline)' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </h2>
                {unreadCount > 0 && (
                  <button
                    onClick={readAll}
                    className="text-[13px] px-4 py-2 rounded-lg transition-colors"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  >
                    모두 읽음
                  </button>
                )}
              </div>

              {/* 카테고리 필터 탭 */}
              <div
                className="flex gap-1 mb-6 p-1 rounded-xl"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              >
                {FILTER_TABS.map(tab => {
                  const tabUnread = tab.key === 'all'
                    ? 0
                    : notifications.filter(n => n.category === tab.key && !n.is_read).length
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setNotiFilter(tab.key)}
                      className="flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center justify-center gap-1"
                      style={{
                        background: notiFilter === tab.key ? 'var(--color-surface)' : 'transparent',
                        color: notiFilter === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        boxShadow: notiFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      {tab.label}
                      {tabUnread > 0 && (
                        <span
                          className="text-[9px] font-bold px-1 py-0.5 rounded-full text-white"
                          style={{ background: 'var(--color-status-deadline)' }}
                        >
                          {tabUnread}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* 알림 목록 */}
              {notiLoading ? (
                <div className="flex items-center justify-center py-20" style={{ color: 'var(--color-text-muted)' }}>
                  불러오는 중...
                </div>
              ) : filteredNotis.length === 0 ? (
                <div
                  className="rounded-xl flex flex-col items-center justify-center py-24"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                >
                  <Bell size={36} className="mb-3" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
                    {notiFilter === 'all' ? '알림이 없어요.' : '해당 카테고리의 알림이 없어요.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {Object.entries(groups).map(([groupKey, items]) => {
                    if (items.length === 0) return null
                    return (
                      <div key={groupKey}>
                        {/* 날짜 그룹 라벨 */}
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className="text-[11px] font-semibold uppercase tracking-wide shrink-0"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {groupLabels[groupKey]}
                          </span>
                          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                          <span className="text-[11px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                            {items.length}건
                          </span>
                        </div>
                        {/* 알림 아이템 */}
                        <div className="flex flex-col gap-2">
                          {items.map(noti => <NotiItem key={noti._id} noti={noti} />)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ═══ 연동 탭 ═══ */}
          {activeTab === 'connect' && (
            <>
              <h2 className="text-[22px] font-bold mb-8" style={{ letterSpacing: '-0.4px' }}>연동</h2>
              {[
                { name: 'Google', desc: 'Google 계정으로 간편 로그인' },
                { name: 'Kakao',  desc: 'Kakao 계정으로 간편 로그인' },
                { name: 'Naver',  desc: 'Naver 계정으로 간편 로그인' },
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
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
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
          {/* 경고 아이콘 */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            <Trash2 size={22} style={{ color: 'var(--color-status-deadline)' }} />
          </div>

          <h2 className="text-[20px] font-bold mb-2 text-center" style={{ color: 'var(--color-text-primary)' }}>
            정말 탈퇴할까요?
          </h2>
          <p className="text-[13px] mb-6 text-center leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            탈퇴하면 모든 보드와 카드가 삭제돼요.<br />
            이 작업은 <span style={{ color: 'var(--color-status-deadline)', fontWeight: 600 }}>되돌릴 수 없어요.</span>
            {profile?.provider === 'local' && <><br />확인을 위해 비밀번호를 입력해주세요.</>}
          </p>

          {profile?.provider === 'local' && (
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={deleteConfirmPw}
              onChange={(e) => setDeleteConfirmPw(e.target.value)}
              className="w-full h-11 px-4 rounded-lg text-[14px] outline-none mb-5"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-status-deadline)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setDeleteModalOpen(false); setDeleteConfirmPw('') }}
              className="flex-1 h-11 rounded-lg text-[13px] font-medium transition-all"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
            >
              취소
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={profile?.provider === 'local' && !deleteConfirmPw}
              className="flex-1 h-11 rounded-lg text-[13px] font-semibold text-white transition-all"
              style={{
                background: 'var(--color-status-deadline)',
                opacity: (profile?.provider === 'local' && !deleteConfirmPw) ? 0.4 : 1,
                cursor: (profile?.provider === 'local' && !deleteConfirmPw) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!(profile?.provider === 'local' && !deleteConfirmPw)) {
                  e.currentTarget.style.background = '#dc2626'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-status-deadline)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
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