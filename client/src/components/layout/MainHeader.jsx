import { Search, BellRing, Menu, LogOut, Moon, Sun, Check, ChevronRight, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { logout as logoutApi } from '../../api/authApi'
import { getRecentSearches, deleteSearchHistory } from '../../api/searchApi'
import toast from 'react-hot-toast'
import MainLogoButton from '../common/MainLogoButton'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import useSidebarStore from '../../store/sidebarStore'
import useNotificationStore from '../../store/notificationStore'

const SIDEBAR_OPEN_WIDTH   = 260
const SIDEBAR_CLOSED_WIDTH = 64
const SIDEBAR_PADDING      = 16

const CATEGORY_MAP = {
  DEADLINE: { label: '마감 임박', color: 'var(--color-status-deadline)' },
  UPDATE:   { label: '업데이트', color: 'var(--color-brand)' },
  SYSTEM:   { label: '시스템',   color: 'var(--color-text-muted)' },
  COMMENT:  { label: '댓글',     color: 'var(--color-status-doing)' },
}

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1)  return '방금 전'
  if (m < 60) return `${m}분 전`
  if (h < 24) return `${h}시간 전`
  return `${d}일 전`
}

const MainHeader = ({ onToggleSidebar, hideToggle = false }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { isOpen } = useSidebarStore()
  const { notifications, unreadCount, fetchNotifications, readOne, readAll } = useNotificationStore()

  const [notiOpen, setNotiOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const notiRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setNotiOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const loadRecentSearches = async () => {
    try {
      const { data } = await getRecentSearches()
      setRecentSearches(data)
    } catch {}
  }

  const handleDeleteRecent = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteSearchHistory(id)
      setRecentSearches(prev => prev.filter(h => h._id !== id))
    } catch {}
  }

  const handleLogout = async () => {
    try { await logoutApi() } catch {}
    finally {
      logout()
      toast.success('로그아웃 되었습니다 👏')
      navigate('/login')
    }
  }

  const handleToggleTheme = () => {
    toggleTheme()
    const nextDark = !isDark
    toast(nextDark ? '🌙 다크 모드' : '☀️ 라이트 모드', {
      duration: 1200,
      style: {
        fontSize: '13px',
        padding: '8px 14px',
        background: nextDark ? '#1c1f26' : '#ffffff',
        color:      nextDark ? '#e8eaf0' : '#1a1d23',
        border:     `1px solid ${nextDark ? '#2e323d' : '#e2e6ea'}`,
      },
    })
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const trimmed = searchQuery.trim()
      if (!trimmed) {
        toast.error('검색어를 입력해주세요.')
        return
      }
      if (trimmed.length < 2) {
        toast.error('검색어를 2글자 이상 입력해주세요.')
        return
      }
      setSearchFocused(false)
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
      setSearchQuery('')
      loadRecentSearches()
    }
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const previewNotis = [
    ...notifications.filter(n => !n.is_read),
    ...notifications.filter(n => n.is_read && new Date(n.createdAt) > sevenDaysAgo),
  ].slice(0, 5)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center border-b border-[var(--color-border-subtle)] backdrop-blur-[12px]"
      style={{ background: 'var(--color-header-bg)' }}
    >
      {/* ── 왼쪽 영역 ── */}
      <div
        className="flex items-center flex-shrink-0 transition-all duration-200"
        style={{
          width: hideToggle
            ? `${SIDEBAR_OPEN_WIDTH}px`
            : isOpen
            ? `${SIDEBAR_OPEN_WIDTH}px`
            : `${SIDEBAR_CLOSED_WIDTH}px`,
        }}
      >
        {hideToggle ? (
          <div className="w-full flex items-center justify-center">
            <MainLogoButton showText={true} />
          </div>
        ) : (
          <>
            <div style={{ paddingLeft: `${SIDEBAR_PADDING}px` }}>
              <button
                onClick={onToggleSidebar}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] transition-colors flex-shrink-0"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Menu size={20} />
              </button>
            </div>
            {isOpen ? (
              <div className="ml-2">
                <MainLogoButton showText={true} />
              </div>
            ) : (
              <div style={{ position: 'absolute', left: `${SIDEBAR_CLOSED_WIDTH + 12}px`, whiteSpace: 'nowrap' }}>
                <MainLogoButton showText={true} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── 가운데: 검색바 ── */}
      <div
        className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ position: 'absolute', left: `${SIDEBAR_OPEN_WIDTH}px`, right: '280px' }}
        ref={searchRef}
      >
        <div className="relative w-full" style={{ maxWidth: '560px' }}>
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)', zIndex: 1 }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => { setSearchFocused(true); loadRecentSearches() }}
            placeholder="보드, 카드 검색..."
            className="w-full h-[40px] pl-10 pr-16 rounded-[10px] text-[14px] outline-none transition-all"
            style={{
              background: 'var(--color-surface-2)',
              border: `1px solid ${searchFocused ? 'var(--color-brand)' : 'var(--color-border)'}`,
              color: 'var(--color-text-primary)',
              boxShadow: searchFocused ? '0 0 0 3px rgba(45,64,142,0.08)' : 'none',
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd
              className="text-[11px] px-[6px] py-[2px] rounded-[4px] font-medium"
              style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              ⌘K
            </kbd>
          </div>

          {/* 최근 검색어 드롭다운 */}
          {searchFocused && recentSearches.length > 0 && (
            <div
              className="absolute top-[48px] left-0 right-0 rounded-[12px] overflow-hidden z-50"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  최근 검색어
                </span>
              </div>
              {recentSearches.map(h => (
                <div
                  key={h._id}
                  onClick={() => {
                    setSearchFocused(false)
                    navigate(`/search?q=${encodeURIComponent(h.keyword)}`)
                    setSearchQuery('')
                  }}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center gap-3">
                    <Search size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <span className="text-[13px]">{h.keyword}</span>
                  </div>
                  <button
                    type="button"
                    onClick={e => handleDeleteRecent(h._id, e)}
                    className="w-5 h-5 flex items-center justify-center rounded-full transition-colors flex-shrink-0"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-status-deadline)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 오른쪽 ── */}
      <div className="flex items-center gap-1 flex-shrink-0 pr-6 ml-auto">

        {/* 다크모드 토글 */}
        <button
          onClick={handleToggleTheme}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] transition-colors overflow-hidden"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border-subtle)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          <span key={isDark ? 'dark' : 'light'} style={{ display: 'flex', animation: 'themeIconSpin 0.35s ease' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </span>
        </button>

        {/* ── 알림 버튼 + 드롭다운 ── */}
        <div className="relative" ref={notiRef}>
          <button
            onClick={() => setNotiOpen(prev => !prev)}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] transition-colors relative"
            style={{
              color: notiOpen ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              background: notiOpen ? 'var(--color-border-subtle)' : 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border-subtle)'}
            onMouseLeave={(e) => { if (!notiOpen) e.currentTarget.style.background = 'transparent' }}
            title="알림"
          >
            <BellRing size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-[14px] h-[14px] rounded-full
                           flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: 'var(--color-status-deadline)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── 알림 드롭다운 패널 ── */}
          {notiOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] rounded-2xl z-50"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                animation: 'slideDown 0.18s ease-out',
              }}
            >
              {/* 삼각형 꼭지 */}
              <div className="absolute -top-[7px] right-[9px] w-[14px] h-[7px] overflow-hidden pointer-events-none">
                <div
                  className="absolute top-[3px] left-0 w-[14px] h-[14px] rotate-45 rounded-[2px]"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              {/* 패널 헤더 */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b rounded-t-2xl overflow-hidden"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
              >
                <div className="flex items-center gap-2">
                  <Bell size={15} style={{ color: 'var(--color-text-primary)' }} />
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    알림
                  </span>
                  {unreadCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: 'var(--color-status-deadline)' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => readAll()}
                    className="text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                    style={{ color: 'var(--color-brand)', background: 'rgba(45,64,142,0.08)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(45,64,142,0.14)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(45,64,142,0.08)'}
                  >
                    모두 읽음
                  </button>
                )}
              </div>

              {/* 알림 목록 */}
              <div className="overflow-y-auto rounded-none" style={{ maxHeight: '360px' }}>
                {previewNotis.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell size={28} style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                      새로운 알림이 없어요
                    </p>
                  </div>
                ) : (
                  previewNotis.map((noti, idx) => {
                    const cat = CATEGORY_MAP[noti.category] ?? { label: noti.category, color: 'var(--color-text-muted)' }
                    return (
                      <div key={noti._id}>
                        <div
                          className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                          style={{ background: noti.is_read ? 'transparent' : 'rgba(45,64,142,0.04)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = noti.is_read ? 'transparent' : 'rgba(45,64,142,0.04)'}
                          onClick={() => {
                            readOne(noti._id)
                            setNotiOpen(false)
                            if (noti.link_url) {
                              const url = noti.link_url
                              const isValid = url.startsWith('/home') ||
                                              url.startsWith('/board/') ||
                                              url.startsWith('/mypage') ||
                                              url.startsWith('/priority') ||
                                              url.startsWith('/starred')
                              setTimeout(() => navigate(isValid ? url : '/home'), 50)
                            }
                          }}
                        >
                          <div className="mt-1.5 shrink-0">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: noti.is_read ? 'var(--color-border)' : cat.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: `${cat.color}18`, color: cat.color }}
                              >
                                {cat.label}
                              </span>
                            </div>
                            <p
                              className="text-[13px] font-medium truncate"
                              style={{ color: noti.is_read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
                            >
                              {noti.title}
                            </p>
                            <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                              {noti.content}
                            </p>
                            <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                              {timeAgo(noti.createdAt)}
                            </p>
                          </div>
                          {!noti.is_read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); readOne(noti._id) }}
                              className="w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5 transition-colors"
                              style={{ color: 'var(--color-text-muted)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-brand)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                              title="읽음 표시"
                            >
                              <Check size={12} />
                            </button>
                          )}
                        </div>
                        {idx < previewNotis.length - 1 && (
                          <div className="mx-4 border-t" style={{ borderColor: 'var(--color-border)' }} />
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* 푸터 */}
              <div className="border-t rounded-b-2xl overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => { navigate('/mypage?tab=alarm'); setNotiOpen(false) }}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium transition-colors"
                  style={{ color: 'var(--color-brand)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  전체 알림 보기
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="w-[1px] h-[20px] mx-2" style={{ background: 'var(--color-border)' }} />

        {/* 프로필 + 닉네임 */}
        <button
          onClick={() => navigate('/mypage')}
          className="flex items-center gap-2 h-[36px] px-3 rounded-[8px] transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border-subtle)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div
            className="w-[26px] h-[26px] rounded-full flex-shrink-0 overflow-hidden"
            style={{ background: 'var(--color-brand)', border: '1.5px solid var(--color-border)' }}
          >
            {user?.profile_img && user.profile_img !== 'default_profile.png'
              ? <img src={`http://localhost:5000${user.profile_img}`} alt="프로필" className="w-full h-full object-cover" />
              : <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '11px', fontWeight: 700,
                  lineHeight: 1,
                }}>
                  {user?.nickname?.[0]?.toUpperCase() ?? 'U'}
                </div>
            }
          </div>
          <span
            className="text-[13px] font-medium"
            style={{
              color: 'var(--color-text-primary)',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.nickname ?? '마이페이지'}
          </span>
        </button>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-border-subtle)'
            e.currentTarget.style.color = 'var(--color-status-deadline)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
          title="로그아웃"
        >
          <LogOut size={16} />
        </button>

      </div>
    </header>
  )
}

export default MainHeader