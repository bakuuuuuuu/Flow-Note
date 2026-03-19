import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Star, AlertCircle, Settings, BookOpen, Plus, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import useBoardStore from '../../store/boardStore'
import NewBoardModal from '../common/NewBoardModal'
import { getCategoryEmoji } from '../../constants/categories'

const SIDEBAR_BOARD_LIMIT = 10

const MainSidebar = ({ open }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { boards, fetchBoards } = useBoardStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchBoards()
  }, [])

  const menus = [
    { icon: Home,        label: '홈',       path: '/home' },
    { icon: AlertCircle, label: '우선순위', path: '/priority' },
    { icon: Star,        label: '즐겨찾기', path: '/starred' },
  ]

  const visibleBoards = [
    ...boards.filter((b) => b.is_starred).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    ...boards.filter((b) => !b.is_starred).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
  ].slice(0, SIDEBAR_BOARD_LIMIT)

  const hasMore = boards.length > SIDEBAR_BOARD_LIMIT

  const isActive = (path) => location.pathname === path

  return (
    <>
      <aside
        className="fixed top-[72px] left-0 h-[calc(100vh-72px)] z-40 flex flex-col border-r transition-all duration-200 overflow-hidden"
        style={{
          width: open ? '260px' : '64px',
          background: 'var(--color-sidebar-bg)',
          borderColor: 'var(--color-border-subtle)',
          backdropFilter: 'blur(15px)',
        }}
      >

        {/* ── 새 보드 만들기 버튼 ── */}
        <div className="px-4 pt-6 pb-2 flex-shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full h-[48px] flex items-center justify-center gap-2 rounded-[12px] text-white font-bold text-[15px] transition-colors hover:opacity-90"
            style={{ background: 'var(--color-brand)', boxShadow: '0px 4px 4px rgba(0,0,0,0.05)' }}
          >
            <Plus size={18} />
            {open && <span>새 보드 만들기</span>}
          </button>
        </div>

        {/* ── 상단 메뉴 (홈 / 우선순위 / 즐겨찾기) ── */}
        <nav className="px-4 pt-3 flex flex-col gap-1 flex-shrink-0">
          {menus.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full h-[40px] flex items-center gap-3 px-3 rounded-[8px] text-[14px] font-medium transition-colors"
              style={{
                color: isActive(path) ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                background: isActive(path) ? 'rgba(45,64,142,0.08)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!isActive(path)) e.currentTarget.style.background = 'var(--color-border-subtle)' }}
              onMouseLeave={(e) => { if (!isActive(path)) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {open && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* ── 구분선 + BOARDS 라벨 ── */}
        <div className="flex-shrink-0 mt-3">
          <div className="mx-4 mb-3 border-t" style={{ borderColor: 'var(--color-border)' }} />
          {open && (
            <p
              className="mb-1 text-[12px] font-bold tracking-[0.6px] text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              BOARDS
            </p>
          )}
        </div>

        {/* ── 보드 목록 + 더보기 버튼 ── */}
        <div className="flex-1 px-4 flex flex-col pb-2">

          {/* 보드 목록 */}
          <div className="flex-1 flex flex-col">
            {visibleBoards.map((board) => (
              <button
                key={board._id}
                onClick={() => {
                  localStorage.setItem('lastBoardId', board._id)
                  navigate(`/board/${board._id}`)
                }}
                className="flex-1 flex items-center gap-3 px-3 rounded-[8px] text-[14px] font-medium transition-colors"
                style={{
                  color: isActive(`/board/${board._id}`) ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                  background: isActive(`/board/${board._id}`) ? 'rgba(45,64,142,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isActive(`/board/${board._id}`)) e.currentTarget.style.background = 'var(--color-border-subtle)' }}
                onMouseLeave={(e) => { if (!isActive(`/board/${board._id}`)) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{getCategoryEmoji(board.category)}</span>
                {open && (
                  <span className="truncate flex-1 text-left">{board.title}</span>
                )}
                {open && board.is_starred && (
                  <Star size={13} fill="currentColor" style={{ color: '#f59e0b', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* 더 보기 버튼 */}
          {hasMore && (
            <button
              onClick={() => navigate('/home')}
              className="h-[40px] flex items-center gap-3 px-3 rounded-[8px] text-[14px] font-medium transition-colors hover:bg-[var(--color-border-subtle)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ChevronRight size={18} style={{ flexShrink: 0 }} />
              {open && <span>{boards.length - SIDEBAR_BOARD_LIMIT}개 더 보기</span>}
            </button>
          )}
        </div>

        {/* ── 하단: 구분선 + 설정/블로그 ── */}
        <div className="flex-shrink-0">
          <div className="mx-4 mb-3 border-t" style={{ borderColor: 'var(--color-border)' }} />
          <div className="px-4 pb-6 flex flex-col gap-1">
            {[
              { icon: Settings, label: '설정',  action: () => {} },
              { icon: BookOpen, label: '블로그', action: () => window.open('https://youngjin99.tistory.com', '_blank') },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full h-[36px] flex items-center gap-3 px-3 rounded-[8px] text-[14px] transition-colors hover:bg-[var(--color-border-subtle)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {open && <span>{label}</span>}
              </button>
            ))}
          </div>
        </div>

      </aside>

      {/* ── 새 보드 만들기 모달 ── */}
      <NewBoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newBoard) => {
          fetchBoards()
          navigate(`/board/${newBoard._id}`)
        }}
      />
    </>
  )
}

export default MainSidebar