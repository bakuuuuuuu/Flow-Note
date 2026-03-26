import { Search, BellRing, Menu, LogOut, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout as logoutApi } from '../../api/authApi'
import toast from 'react-hot-toast'
import MainLogoButton from '../common/MainLogoButton'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import useSidebarStore from '../../store/sidebarStore'

// 사이드바 너비 상수 — MainSidebar와 동일하게 맞춤
const SIDEBAR_OPEN_WIDTH = 260
const SIDEBAR_CLOSED_WIDTH = 64

// 사이드바 안 버튼들의 좌측 패딩 (MainSidebar의 px-4 = 16px)
const SIDEBAR_PADDING = 16

const MainHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { isOpen } = useSidebarStore()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // 실패해도 로그아웃 처리
    } finally {
      logout()
      toast.success('로그아웃 되었습니다 👏')
      navigate('/login')
    }
  }

  const handleToggleTheme = () => {
    toggleTheme()
    toast(isDark ? '☀️ 라이트 모드' : '🌙 다크 모드', {
      duration: 1200,
      style: { fontSize: '13px', padding: '8px 14px' },
    })
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center border-b border-[var(--color-border-subtle)] backdrop-blur-[12px]"
      style={{ background: 'var(--color-header-bg)' }}
    >
      {/* ── 왼쪽 영역 — 사이드바 너비 고정 ── */}
      <div
        className="flex items-center flex-shrink-0 transition-all duration-200"
        style={{
          width: isOpen ? `${SIDEBAR_OPEN_WIDTH}px` : `${SIDEBAR_CLOSED_WIDTH}px`,
        }}
      >
        {/* 토글 버튼 — 사이드바 px-4(16px)에 맞춰 정렬 */}
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

        {/* 로고 — 사이드바 접혔을 때: 사이드바 오른쪽 끝 + 마진으로 위치
                   사이드바 펼쳤을 때: 토글 버튼 바로 옆 */}
        {isOpen ? (
          // 펼쳤을 때 — 토글 버튼 바로 옆
          <div className="ml-2">
            <MainLogoButton showText={true} />
          </div>
        ) : (
          // 접혔을 때 — 사이드바 오른쪽 끝(64px) 기준으로 마진 주고 로고+텍스트
          <div
            style={{
              position: 'absolute',
              left: `${SIDEBAR_CLOSED_WIDTH + 12}px`,
              whiteSpace: 'nowrap',
            }}
          >
            <MainLogoButton showText={true} />
          </div>
        )}
      </div>

      {/* ── 가운데: 검색바 — 위치 고정 (marginLeft로 사이드바 너비만큼 보정) ── */}
      <div
        className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          // 전체 너비에서 왼쪽(사이드바) + 오른쪽(버튼들 ~280px) 제외한 공간
          // 사이드바 펼쳤을 때 기준으로 고정
          position: 'absolute',
          left: `${SIDEBAR_OPEN_WIDTH}px`,
          right: '280px',
        }}
      >
        <div className="relative w-full" style={{ maxWidth: '560px' }}>
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder="보드, 카드 검색..."
            className="w-full h-[40px] pl-10 pr-16 rounded-[10px] text-[14px] outline-none transition-all"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-brand)'
              e.target.style.boxShadow = '0 0 0 3px rgba(45,64,142,0.08)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd
              className="text-[11px] px-[6px] py-[2px] rounded-[4px] font-medium"
              style={{
                background: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── 오른쪽 — ml-auto로 오른쪽 끝 고정 ── */}
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
          <span
            key={isDark ? 'dark' : 'light'}
            style={{ display: 'flex', animation: 'themeIconSpin 0.35s ease' }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </span>
        </button>

        {/* 알림 버튼 */}
        <button
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] transition-colors relative"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border-subtle)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="알림"
        >
          <BellRing size={18} />
        </button>

        {/* 구분선 */}
        <div
          className="w-[1px] h-[20px] mx-2"
          style={{ background: 'var(--color-border)' }}
        />

        {/* 프로필 + 닉네임 */}
        <button
          onClick={() => navigate('/mypage')}
          className="flex items-center gap-2 h-[36px] px-3 rounded-[8px] transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border-subtle)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            style={{ background: 'var(--color-brand)' }}
          >
            {user?.nickname?.[0] ?? 'U'}
          </div>
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
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