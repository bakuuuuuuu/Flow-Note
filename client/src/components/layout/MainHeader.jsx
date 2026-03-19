import { Search, Bell, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout as logoutApi } from '../../api/authApi'
import toast from 'react-hot-toast'
import MainLogoButton from '../common/MainLogoButton'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'

const MainHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()

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

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-6 border-b border-[var(--color-border-subtle)] backdrop-blur-[10px]"
      style={{ background: 'var(--color-header-bg)' }}
    >
      {/* ── 왼쪽: 토글 + 로고 ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition-colors"
        >
          <Menu size={20} />
        </button>
        <MainLogoButton />
      </div>

      {/* ── 가운데: 검색바 ── */}
      <div className="relative" style={{ width: '400px' }}>
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          placeholder="검색어 입력"
          className="w-full h-[44px] pl-9 pr-4 rounded-[10px] text-[14px] text-[var(--color-text-secondary)] outline-none"
          style={{
            background: 'var(--color-border-subtle)',
            border: '1px solid var(--color-border-subtle)',
          }}
        />
      </div>

      {/* ── 오른쪽: 다크모드 / 알림 / 마이페이지 / 로그아웃 ── */}
      <div className="flex items-center gap-4">

        {/* 다크모드 토글 */}
        <button
          onClick={toggleTheme}
          className="w-[48px] h-[26px] rounded-full relative transition-colors duration-200"
          style={{ background: isDark ? 'var(--color-brand)' : 'rgba(0,0,0,0.1)' }}
        >
          <span
            className="absolute top-[3px] w-[20px] h-[20px] bg-white rounded-full shadow transition-all duration-200"
            style={{ left: isDark ? '25px' : '3px' }}
          />
        </button>

        {/* 알림 버튼 */}
        <button className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition-colors">
          <Bell size={20} />
        </button>

        {/* 유저 프로필 + 마이페이지 */}
        <button
          onClick={() => navigate('/mypage')}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <div className="w-[32px] h-[32px] rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-[13px] font-bold">
            {user?.nickname?.[0] ?? 'U'}
          </div>
          <span className="text-[14px] text-[var(--color-text-primary)] font-medium">
            마이페이지
          </span>
        </button>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          로그아웃
        </button>

      </div>
    </header>
  )
}

export default MainHeader