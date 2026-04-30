import { useState, useEffect } from 'react'
import { User, Bell, Link, LogOut, Trash2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import {
  getProfile, updateProfile, updatePassword,
  updateProfileImage, deleteProfileImage, deleteAccount, logout,
} from '../api/authApi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useNotificationStore from '../store/notificationStore'
import ProfileTab from '../components/mypage/ProfileTab'
import AlarmTab from '../components/mypage/AlarmTab'
import ConnectTab from '../components/mypage/ConnectTab'
import DeleteModal from '../components/mypage/DeleteModal'

const TABS = [
  { key: 'profile', label: '프로필', icon: User },
  { key: 'alarm',   label: '알림',   icon: Bell },
  { key: 'connect', label: '연동',   icon: Link },
]

const MyPage = () => {
  const { user, setUser, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editForm, setEditForm] = useState({ nickname: '', status_message: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [nicknameStatus, setNicknameStatus] = useState(null)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)

  const [deleteConfirmPw, setDeleteConfirmPw] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [notiFilter, setNotiFilter] = useState('all')

  const { notifications, unreadCount, loading: notiLoading, fetchNotifications, readOne, readAll, removeOne } = useNotificationStore()

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
    if (editForm.nickname !== profile?.nickname && nicknameStatus !== 'ok') {
      toast.error('닉네임 중복 확인을 해주세요.'); return
    }
    setEditLoading(true)
    try {
      const { data } = await updateProfile(editForm)
      setProfile(prev => ({ ...prev, ...data.user }))
      setUser({ ...user, nickname: data.user.nickname })
      setNicknameStatus(null)
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
    ? `${import.meta.env.VITE_API_URL}${profile.profile_img}`
    : null
  const initial = (profile?.nickname ?? user?.nickname ?? 'U')[0].toUpperCase()

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
      불러오는 중...
    </div>
  )

  return (
    <div className="flex min-h-[calc(100vh-72px)]" style={{ color: 'var(--color-text-primary)' }}>

      {/* ── 좌측 메뉴바 ── */}
      <aside
        className="fixed top-[72px] left-0 h-[calc(100vh-72px)] w-[260px] flex flex-col justify-between py-8 px-4 z-40"
        style={{ background: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-border-subtle)', backdropFilter: 'blur(15px)' }}
      >
        <nav className="flex flex-col gap-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors text-left w-full"
                style={{ background: active ? 'rgba(45,64,142,0.08)' : 'transparent', color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-border-subtle)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span className="flex-1">{label}</span>
                {key === 'alarm' && unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--color-status-deadline)' }}>
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
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              profileImgUrl={profileImgUrl}
              initial={initial}
              editForm={editForm}
              setEditForm={setEditForm}
              editLoading={editLoading}
              nicknameStatus={nicknameStatus}
              setNicknameStatus={setNicknameStatus}
              pwForm={pwForm}
              setPwForm={setPwForm}
              showPw={showPw}
              setShowPw={setShowPw}
              pwLoading={pwLoading}
              onImageChange={handleImageChange}
              onImageDelete={handleImageDelete}
              onEditSave={handleEditSave}
              onPasswordChange={handlePasswordChange}
              onEditCancel={() => setEditForm({ nickname: profile?.nickname, status_message: profile?.status_message ?? '' })}
            />
          )}
          {activeTab === 'alarm' && (
            <AlarmTab
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notiLoading}
              notiFilter={notiFilter}
              setNotiFilter={setNotiFilter}
              readOne={readOne}
              readAll={readAll}
              removeOne={removeOne}
            />
          )}
          {activeTab === 'connect' && (
            <ConnectTab profile={profile} />
          )}
        </div>
      </div>

      {/* ── 탈퇴 모달 ── */}
      {deleteModalOpen && (
        <DeleteModal
          profile={profile}
          deleteConfirmPw={deleteConfirmPw}
          setDeleteConfirmPw={setDeleteConfirmPw}
          onDelete={handleDeleteAccount}
          onClose={() => { setDeleteModalOpen(false); setDeleteConfirmPw('') }}
        />
      )}
    </div>
  )
}

export default MyPage