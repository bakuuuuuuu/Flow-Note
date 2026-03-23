import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useListStore from '../../store/listStore'
import useSidebarStore from '../../store/sidebarStore'
import KanbanColumn from './KanbanColumn'

const KanbanBoard = ({ boardId, onCardClick }) => {
  const { lists } = useListStore()
  const { isOpen: sidebarOpen } = useSidebarStore()
  const scrollRef = useRef(null)
  const [scrollPos, setScrollPos] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)

  const GAP = 24
  const SIDEBAR_WIDTH = sidebarOpen ? 260 : 64
  const MAIN_PADDING = 80
  const visible = sidebarOpen ? 4 : 4.5
  const columnWidth = Math.floor(
    (window.innerWidth - SIDEBAR_WIDTH - MAIN_PADDING - GAP * (Math.floor(visible) - 1)) / visible
  )

  const updateScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setScrollPos(el.scrollLeft)
    setMaxScroll(el.scrollWidth - el.clientWidth)
  }, [])

  useEffect(() => {
    const timer = setTimeout(updateScroll, 500)
    return () => clearTimeout(timer)
  }, [lists, sidebarOpen, updateScroll])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScroll)
    window.addEventListener('resize', updateScroll)
    return () => {
      el.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [updateScroll])

  const handleScroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * (columnWidth + GAP), behavior: 'smooth' })
    setTimeout(updateScroll, 400)
  }

  const canScrollLeft = scrollPos > 0
  const canScrollRight = maxScroll > 0 && scrollPos < maxScroll - 1

  if (lists.length === 0) return (
    <div
      className="flex items-center justify-center"
      style={{ height: 'calc(100vh - 260px)', color: 'var(--color-text-muted)' }}
    >
      <p className="text-[14px]">리스트가 없어요. 새 보드를 만들어보세요!</p>
    </div>
  )

  return (
    <div
      className="relative"
      style={{ height: 'calc(100vh - 260px)', width: '100%' }}
    >

      {/* ── 좌측 화살표 ── */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-[40px] h-[40px] flex items-center justify-center rounded-full shadow-lg transition-all"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* ── 우측 화살표 ── */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-[40px] h-[40px] flex items-center justify-center rounded-full shadow-lg transition-all"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* ── 칸반 컬럼 스크롤 영역 ── */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-10 py-6"
        style={{
          height: '100%',
          width: '100%',
          alignItems: 'stretch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {lists.map((list) => (
          <KanbanColumn
            key={list._id}
            list={list}
            onCardClick={onCardClick}
            columnWidth={columnWidth}
            boardId={boardId}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard