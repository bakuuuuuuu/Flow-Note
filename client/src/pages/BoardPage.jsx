import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, SquarePen, Share2, SlidersHorizontal } from 'lucide-react'
import useBoardStore from '../store/boardStore'
import useListStore from '../store/listStore'
import { getCategoryEmoji } from '../constants/categories'
import DeleteBoardModal from '../components/board/DeleteBoardModal'
import KanbanBoard from '../components/board/KanbanBoard'
import CalendarView from '../components/board/CalendarView'
import CardDetailModal from '../components/board/CardDetailModal'
import EditBoardModal from "../components/board/EditBoardModal";
import ShareModal from "../components/board/ShareModal";
import FilterModal from "../components/board/FilterModal";
import toast from 'react-hot-toast'

const BoardPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentBoard, fetchBoardById, editBoard, removeBoard } = useBoardStore()
  const { setLists } = useListStore()
  const [activeTab, setActiveTab] = useState('board')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cardDetailOpen, setCardDetailOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState({ labels: [], statuses: [], deadline: null })

  useEffect(() => {
    const load = async () => {
      try {
        await fetchBoardById(id)
      } catch {
        toast.error('보드를 불러오는데 실패했어요.')
        navigate('/home')
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (currentBoard?.lists) {
      setLists(currentBoard.lists)
    }
  }, [currentBoard])

  const handleToggleStar = async () => {
    try {
      await editBoard(id, { is_starred: !currentBoard.is_starred })
      if (!currentBoard.is_starred) {
        toast.success('즐겨찾기에 추가됐어요 ⭐')
      } else {
        toast.success('즐겨찾기에서 제거됐어요')
      }
    } catch {
      toast.error('즐겨찾기 변경에 실패했어요.')
    }
  }

  const handleDeleteBoard = async () => {
    setDeleteLoading(true)
    try {
      await removeBoard(id)
      toast.success('보드가 삭제되었어요 🗑️')
      navigate('/home')
    } catch {
      toast.error('보드 삭제에 실패했어요.')
    } finally {
      setDeleteLoading(false)
      setDeleteModalOpen(false)
    }
  }

  const handleCardClick = (card) => {
    setSelectedCard(card)
    setCardDetailOpen(true)
  }

  const handleApplyFilter = (filter) => {
    setActiveFilter(filter)
  }

  const filterCount =
    activeFilter.labels.length +
    activeFilter.statuses.length +
    (activeFilter.deadline ? 1 : 0)

  const getDdayText = (deadline) => {
    if (!deadline) return null
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff < 0)   return { label: `D+${Math.abs(diff)}`, color: 'var(--color-text-muted)' }
    if (diff === 0) return { label: 'D-Day',               color: 'var(--color-status-deadline)' }
    if (diff <= 3)  return { label: `D-${diff}`,           color: 'var(--color-status-deadline)' }
    if (diff <= 7)  return { label: `D-${diff}`,           color: 'var(--color-status-doing)' }
    return               { label: `D-${diff}`,             color: 'var(--color-text-muted)' }
  }

  if (!currentBoard) return (
    <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
      <p>불러오는 중...</p>
    </div>
  )

  const dday = getDdayText(currentBoard.deadline)
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 72px)' }}>

      {/* ── 제목 영역 ── */}
      <div className="px-10 pt-12 pb-2 flex-shrink-0">

        {/* 아이콘 + 타이틀 + 수정 버튼 + 보드 삭제 */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[36px] leading-none w-[40px] flex items-center justify-center">
            {getCategoryEmoji(currentBoard.category)}
          </span>
          <h1
            className="text-[32px] font-bold"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.8px' }}
          >
            {currentBoard.title}
          </h1>
          <button
            onClick={() => setEditModalOpen(true)}
            className="transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <SquarePen size={22} />
          </button>

          {/* 보드 삭제 — 오른쪽 끝 */}
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="ml-auto h-[34px] px-4 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-2"
            style={{
              color: 'white',
              border: '1px solid var(--color-status-deadline)',
              background: 'var(--color-status-deadline)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#c92a2a'
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-status-deadline)'
              e.currentTarget.style.color = 'white'
            }}
          >
            보드 삭제
          </button>
        </div>

        {/* 즐겨찾기 + 탭 버튼 + 날짜 + Share/Filter */}
        <div className="flex items-center gap-3">

          {/* 즐겨찾기 */}
          <div className="w-[40px] flex items-center justify-center">
            <button
              onClick={handleToggleStar}
              className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] transition-all cursor-pointer"
              style={{
                background: currentBoard.is_starred ? '#f59e0b' : 'transparent',
                border: `1px solid ${currentBoard.is_starred ? '#f59e0b' : 'var(--color-border)'}`,
                color: currentBoard.is_starred ? 'white' : 'var(--color-text-muted)',
              }}
            >
              <Star size={18} fill={currentBoard.is_starred ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* 탭 버튼 */}
          <div className="flex gap-1">
            {[
              { key: 'board',    label: 'Board' },
              { key: 'calendar', label: 'Calendar' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="w-[96px] h-[36px] rounded-[6px] text-[14px] font-medium border transition-colors"
                style={{
                  background: activeTab === key ? 'var(--color-surface)' : 'transparent',
                  borderColor: 'var(--color-border)',
                  color: activeTab === key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 시작일 ~ 마감일 & D-day */}
          {(currentBoard.start_date || currentBoard.deadline) && (
            <span className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
              {currentBoard.start_date && currentBoard.deadline
                ? `${formatDate(currentBoard.start_date)} - ${formatDate(currentBoard.deadline)}`
                : currentBoard.deadline
                ? formatDate(currentBoard.deadline)
                : formatDate(currentBoard.start_date)
              }
            </span>
          )}
          {dday && (
            <span className="text-[14px] font-semibold" style={{ color: dday.color }}>
              {dday.label}
            </span>
          )}

          {/* Share / Filter */}
          <div className="ml-auto flex items-center gap-4">

            {/* Share */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1 h-[36px] text-[11px] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>

            {/* Filter */}
            <button
              onClick={() => setFilterModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1 h-[36px] text-[11px] transition-colors"
              style={{ color: filterCount > 0 ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = filterCount > 0 ? 'var(--color-brand)' : 'var(--color-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = filterCount > 0 ? 'var(--color-brand)' : 'var(--color-text-secondary)'}
            >
              <div className="relative">
                <SlidersHorizontal size={16} />
                {filterCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[9px] font-bold
                               flex items-center justify-center text-white"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                  >
                    {filterCount}
                  </span>
                )}
              </div>
              <span>Filter</span>
            </button>

          </div>
        </div>

        {/* 구분선 */}
        <div className="mt-4 border-t" style={{ borderColor: 'var(--color-border)' }} />
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="flex-1 min-h-0">
        {activeTab === 'board' && (
          <KanbanBoard boardId={id} onCardClick={handleCardClick} filter={activeFilter} />
        )}
        {activeTab === 'calendar' && (
          <CalendarView onCardClick={handleCardClick} />
        )}
      </div>

      {/* ── 카드 상세 모달 ── */}
      <CardDetailModal
        isOpen={cardDetailOpen}
        onClose={() => {
          setCardDetailOpen(false)
          setSelectedCard(null)
        }}
        card={selectedCard}
        boardTitle={currentBoard?.title}
      />

      {/* ── 보드 수정 모달 ── */}
      <EditBoardModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        board={currentBoard}
        onSuccess={() => fetchBoardById(id)}
      />

      {/* ── Share 모달 ── */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        board={currentBoard}
      />

      {/* ── Filter 모달 ── */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilter}
        initialFilter={activeFilter}
      />

      {/* ── 보드 삭제 확인 모달 ── */}
      <DeleteBoardModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        boardTitle={currentBoard.title}
        onDelete={handleDeleteBoard}
        deleteLoading={deleteLoading}
      />

    </div>
  )
}

export default BoardPage