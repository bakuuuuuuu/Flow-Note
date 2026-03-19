import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, AlertCircle, LayoutGrid, Plus } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useBoardStore from '../store/boardStore'
import { getCategoryEmoji } from '../constants/categories'
import NewBoardModal from '../components/common/NewBoardModal'

const PAGE_CONFIG = {
  all: {
    icon: LayoutGrid,
    iconColor: 'var(--color-brand)',
    title: '내 보드',
    description: (count) => `총 ${count}개의 보드가 있어요.`,
    emptyTitle: '아직 보드가 없어요',
    emptyDesc: '새 보드를 만들어서 시작해보세요! 😊',
    filter: (boards) => boards,
    showAddButton: true,
  },
  priority: {
    icon: AlertCircle,
    iconColor: 'var(--color-status-deadline)',
    title: '우선순위',
    description: () => '마감일이 임박한 순서로 정렬돼요.',
    emptyTitle: '우선순위 보드가 없어요',
    emptyDesc: '마감일이 설정된 보드가 없어요.',
    filter: (boards) => [...boards].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline) - new Date(b.deadline)
    }),
    showAddButton: false,
  },
  starred: {
    icon: Star,
    iconColor: '#f59e0b',
    iconFill: true,
    title: '즐겨찾기',
    description: (count) => `즐겨찾기한 보드 ${count}개`,
    emptyTitle: '즐겨찾기한 보드가 없어요',
    emptyDesc: '보드의 별 아이콘을 눌러서 즐겨찾기해보세요! 😊',
    filter: (boards) => boards.filter((b) => b.is_starred),
    showAddButton: false,
  },
}

const getDdayText = (deadline) => {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0)  return { label: `D+${Math.abs(diff)}`, color: 'var(--color-text-muted)' }
  if (diff === 0) return { label: 'D-Day',              color: 'var(--color-status-deadline)' }
  if (diff <= 3)  return { label: `D-${diff}`,          color: 'var(--color-status-deadline)' }
  if (diff <= 7)  return { label: `D-${diff}`,          color: 'var(--color-status-doing)' }
  return              { label: `D-${diff}`,              color: 'var(--color-text-muted)' }
}

const BoardListPage = ({ mode = 'all' }) => {
  const navigate = useNavigate()
  const { boards, fetchBoards, loading } = useBoardStore()
  const { justLoggedIn, setJustLoggedIn } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const config = PAGE_CONFIG[mode]

  useEffect(() => {
    const load = async () => {
      await fetchBoards()
      if (mode === 'all' && justLoggedIn) {
        setJustLoggedIn(false)
        const lastBoardId = localStorage.getItem('lastBoardId')
        if (lastBoardId) {
          const exists = useBoardStore.getState().boards.find((b) => b._id === lastBoardId)
          if (exists) {
            navigate(`/board/${lastBoardId}`, { replace: true })
          } else {
            localStorage.removeItem('lastBoardId')
          }
        }
      }
    }
    load()
  }, [])

  const handleBoardClick = (board) => {
    localStorage.setItem('lastBoardId', board._id)
    navigate(`/board/${board._id}`)
  }

  const filteredBoards = config.filter(boards)
  const Icon = config.icon

  if (loading) return (
    <div className="flex items-center justify-center h-full"
      style={{ color: 'var(--color-text-muted)' }}
    >
      <p>불러오는 중...</p>
    </div>
  )

  return (
    <div className="p-8">

      {/* ── 상단 타이틀 ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-start gap-3">
          <Icon
            size={28}
            fill={config.iconFill ? 'currentColor' : 'none'}
            style={{ color: config.iconColor, flexShrink: 0, marginTop: '8px' }}
          />
          <div>
            <h1
              className="text-[28px] font-bold mb-1"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.6px' }}
            >
              {config.title}
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
              {config.description(filteredBoards.length)}
            </p>
          </div>
        </div>
      </div>

      {/* ── 보드 없을 때 ── */}
      {filteredBoards.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-4"
          style={{ minHeight: 'calc(100vh - 280px)' }}
        >
          <span style={{ fontSize: '80px', lineHeight: 1 }}>🚀</span>
          <div className="text-center mt-2">
            <p
              className="text-[22px] font-bold mb-2"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.4px' }}
            >
              {mode === 'all' ? '나만의 워크스페이스를 시작해보세요' : config.emptyTitle}
            </p>
            <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
              {mode === 'all' ? '보드를 만들어 프로젝트나 일정을 관리할 수 있습니다.' : config.emptyDesc}
            </p>
          </div>
          {mode === 'all' && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 h-[52px] px-8 rounded-[10px] text-white text-[15px] font-semibold transition-colors hover:opacity-90 mt-2"
              style={{ background: 'var(--color-brand)' }}
            >
              <Plus size={18} />
              새 보드 만들기
            </button>
          )}
        </div>
      )}

      {/* ── 보드 그리드 ── */}
      {filteredBoards.length > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {filteredBoards.map((board) => {
            const dday = getDdayText(board.deadline)
            return (
              <div
                key={board._id}
                onClick={() => handleBoardClick(board)}
                className="relative rounded-[14px] p-5 cursor-pointer transition-all duration-150 hover:-translate-y-[2px]"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* 즐겨찾기 별 */}
                {board.is_starred && (
                  <Star
                    size={14}
                    className="absolute top-4 right-4"
                    fill="currentColor"
                    style={{ color: '#f59e0b' }}
                  />
                )}

                {/* 보드 아이콘 + 제목 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[28px]">{getCategoryEmoji(board.category)}</span>
                  <h2
                    className="text-[16px] font-semibold truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {board.title}
                  </h2>
                </div>

                {/* 카테고리 + 마감일/D-day */}
                <div className="flex items-center justify-between">
                  {board.category && (
                    <span
                      className="text-[12px] px-2 py-1 rounded-[6px]"
                      style={{
                        background: 'var(--color-bg)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {board.category}
                    </span>
                  )}
                  {dday && (
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: dday.color }}
                    >
                      {dday.label}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── 새 보드 만들기 모달 ── */}
      <NewBoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newBoard) => {
          fetchBoards()
          localStorage.setItem('lastBoardId', newBoard._id)
          navigate(`/board/${newBoard._id}`)
        }}
      />

    </div>
  )
}

export default BoardListPage