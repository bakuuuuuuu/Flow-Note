import { Calendar } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const getDdayText = (due_date) => {
  if (!due_date) return null
  const diff = Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0)  return { label: `D+${Math.abs(diff)}`, color: 'var(--color-text-muted)' }
  if (diff === 0) return { label: 'D-Day',              color: 'var(--color-status-deadline)' }
  if (diff <= 3)  return { label: `D-${diff}`,          color: 'var(--color-status-deadline)' }
  if (diff <= 7)  return { label: `D-${diff}`,          color: 'var(--color-status-doing)' }
  return              { label: `D-${diff}`,              color: 'var(--color-text-muted)' }
}

const KanbanCard = ({ card, onClick }) => {
  const dday = getDdayText(card.due_date)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card._id,
    data: { type: 'card', card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--color-surface)',
        boxShadow: isDragging
          ? '0px 8px 24px rgba(0,0,0,0.15)'
          : '0px 2px 8px rgba(0,0,0,0.05)',
      }}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onClick?.(card)}
      className="rounded-[8px] p-4 transition-shadow duration-150 hover:shadow-md hover:-translate-y-[1px]"
    >
      {/* ── 제목 줄 ── */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[14px] flex-shrink-0 flex items-center justify-center"
          style={{ width: '16px' }}
        >
          📋
        </span>
        <p
          className="text-[14px] font-semibold leading-snug"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {card.title}
        </p>
      </div>

      {/* ── 라벨 태그 ── */}
      {card.labels && card.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1 mb-3" style={{ marginLeft: '24px' }}>
          {card.labels.map((label, i) => (
            <span
              key={i}
              className="h-[18px] px-2 rounded-full text-[11px] font-medium text-white"
              style={{ background: label.color }}
            >
              {label.text}
            </span>
          ))}
        </div>
      ) : card.priority ? (
        <div className="mb-3" style={{ marginLeft: '24px' }}>
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            {card.priority}
          </span>
        </div>
      ) : (
        <div className="mb-3" />
      )}

      {/* ── D-day 줄 ── */}
      <div className="flex items-center gap-2">
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: '16px' }}
        >
          <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
        </span>
        {dday ? (
          <span className="text-[12px]" style={{ color: dday.color }}>
            {dday.label}
          </span>
        ) : card.due_date ? (
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(card.due_date).toLocaleDateString('ko-KR')}
          </span>
        ) : (
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            기한 없음
          </span>
        )}

        {/* 프로필 — 오른쪽 끝 */}
        <div
          className="ml-auto w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white"
          style={{ background: 'var(--color-brand)' }}
        >
          {card.owner_id?.nickname?.[0] ?? 'U'}
        </div>
      </div>
    </div>
  )
}

export default KanbanCard