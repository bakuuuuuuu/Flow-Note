import { useState } from 'react'
import KanbanCard from './KanbanCard'
import NewCardModal from './NewCardModal'

const KanbanColumn = ({ list, onCardClick, columnWidth, boardId }) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{ width: `${columnWidth}px`, height: '100%' }}
    >
      {/* ── 컬럼 헤더 — 상단 고정 ── */}
      <div className="mb-3 px-1 flex-shrink-0">
        <p
          className="text-[18px] font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {list.title}
          <span
            className="text-[16px] font-medium ml-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ({list.cards?.length ?? 0})
          </span>
        </p>
      </div>

      {/* ── 카드 목록 ── */}
      <div
        className="rounded-[12px] p-3 flex flex-col gap-3 overflow-y-auto"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px dashed var(--color-border)',
          flex: 1,
          minHeight: 0,
        }}
      >
        {list.cards && list.cards.length > 0 ? (
          list.cards.map((card) => (
            <KanbanCard
              key={card._id}
              card={card}
              onClick={onCardClick}
            />
          ))
        ) : (
          <div
            className="rounded-[8px] p-4 flex items-center justify-center text-[13px]"
            style={{
              background: 'var(--color-surface)',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
              color: 'var(--color-text-muted)',
              minHeight: '116px',
              flexShrink: 0,
            }}
          >
            등록된 카드가 없어요
          </div>
        )}
      </div>

      {/* ── 카드 추가 버튼 — 하단 고정 ── */}
      <button
        onClick={() => setModalOpen(true)}
        className="mt-3 flex-shrink-0 w-full h-[48px] rounded-[10px] text-[14px] font-medium transition-colors border border-dashed"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-brand)'
          e.currentTarget.style.color = 'var(--color-brand)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.color = 'var(--color-text-muted)'
        }}
      >
        + 카드 추가
      </button>

      {/* ── 새 카드 추가 모달 ── */}
      <NewCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        listId={list._id}
        boardId={boardId}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  )
}

export default KanbanColumn