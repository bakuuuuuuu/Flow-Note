import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import useListStore from '../../store/listStore'
import useCardStore from '../../store/cardStore'
import useSidebarStore from '../../store/sidebarStore'
import useBoardStore from '../../store/boardStore'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import CardDetailModal from './CardDetailModal'

const KanbanBoard = ({ boardId, onCardClick }) => {
  const { lists, setLists } = useListStore()
  const { transferCard } = useCardStore()
  const { isOpen: sidebarOpen } = useSidebarStore()
  const { currentBoard } = useBoardStore()
  const scrollRef = useRef(null)
  const [scrollPos, setScrollPos] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [activeCard, setActiveCard] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const snapshotRef = useRef(null)
  const listsRef = useRef(lists)
  useEffect(() => {
    listsRef.current = lists
  }, [lists])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

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

  const findListByCardId = (cardId, targetLists) =>
    targetLists.find((l) => l.cards?.some((c) => c._id === cardId))

  const handleDragStart = ({ active }) => {
    const currentLists = listsRef.current
    snapshotRef.current = currentLists.map((l) => ({
      ...l,
      cards: [...(l.cards ?? [])],
    }))
    const card = findListByCardId(active.id, currentLists)
      ?.cards?.find((c) => c._id === active.id)
    if (card) setActiveCard(card)
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null)
    const snapshot = snapshotRef.current
    snapshotRef.current = null

    const currentLists = listsRef.current

    if (!over || !snapshot) return

    const sourceList = findListByCardId(active.id, snapshot)
    if (!sourceList) return

    const overIsColumn = over.data?.current?.type === 'column'
    const destListId = overIsColumn
      ? over.id
      : findListByCardId(over.id, snapshot)?._id ?? over.id

    const destList = currentLists.find((l) => l._id === destListId)
    if (!destList) return

    if (sourceList._id === destListId) {
      const currentList = currentLists.find((l) => l._id === sourceList._id)
      const oldIndex = currentList.cards.findIndex((c) => c._id === active.id)
      const newIndex = overIsColumn
        ? currentList.cards.length - 1
        : currentList.cards.findIndex((c) => c._id === over.id)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const newCards = arrayMove(currentList.cards, oldIndex, newIndex)
      const prev = newCards[newIndex - 1]
      const next = newCards[newIndex + 1]
      const newPos = prev && next
        ? Math.floor((prev.pos + next.pos) / 2)
        : prev
        ? Math.floor(prev.pos + 65535)
        : next
        ? Math.floor(next.pos / 2)
        : 65535

      setLists(currentLists.map((l) =>
        l._id === sourceList._id ? { ...l, cards: newCards } : l
      ))

      try {
        await transferCard(active.id, { list_id: sourceList._id, pos: newPos })
      } catch {
        setLists(snapshot)
      }

    } else {
      const movingCard = sourceList.cards.find((c) => c._id === active.id)
      if (!movingCard) return

      const originalDestCards = destList.cards ?? []

      let insertIndex = -1
      if (!overIsColumn && over.id) {
        const idx = originalDestCards.findIndex((c) => c._id === over.id)
        if (idx !== -1) {
          const overRect = over.rect
          const activeTop = active.rect?.current?.translated?.top ?? 0
          const overCenter = overRect ? overRect.top + overRect.height / 2 : 0
          insertIndex = activeTop > overCenter ? idx + 1 : idx
        }
      }

      let newDestCards = [...originalDestCards]
      if (insertIndex >= 0) {
        newDestCards.splice(insertIndex, 0, movingCard)
      } else {
        newDestCards.push(movingCard)
      }

      const insertedIndex = newDestCards.findIndex((c) => c._id === active.id)
      const prev = newDestCards[insertedIndex - 1]
      const next = newDestCards[insertedIndex + 1]
      const newPos = prev && next
        ? Math.floor((prev.pos + next.pos) / 2)
        : prev
        ? Math.floor(prev.pos + 65535)
        : next
        ? Math.floor(next.pos / 2)
        : 65535

      setLists(currentLists.map((l) => {
        if (l._id === sourceList._id)
          return { ...l, cards: l.cards.filter((c) => c._id !== active.id) }
        if (l._id === destListId)
          return { ...l, cards: newDestCards }
        return l
      }))

      try {
        await transferCard(active.id, { list_id: destListId, pos: newPos })
      } catch {
        setLists(snapshot)
      }
    }
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
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                onCardClick={(card) => {
                  setSelectedCard(card)
                  setDetailOpen(true)
                }}
                columnWidth={columnWidth}
                boardId={boardId}
                boardTitle={currentBoard?.title}
              />
            ))}
          </div>

          {/* ── 드래그 중인 카드 오버레이 ── */}
          <DragOverlay>
            {activeCard && (
              <div style={{ transform: 'rotate(2deg)', opacity: 0.95 }}>
                <KanbanCard card={activeCard} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </div>
      </DndContext>

      {/* ── 카드 상세 모달 ── */}
      <CardDetailModal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedCard(null)
        }}
        card={selectedCard}
        boardTitle={currentBoard?.title}
      />
    </>
  )
}

export default KanbanBoard