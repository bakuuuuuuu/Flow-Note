import { CheckSquare, Calendar } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const STATUS_CONFIG = {
  '대기':   { label: '할 일',   color: '#94a3b8' },
  '진행중': { label: '진행 중', color: '#f59e0b' },
  '완료':   { label: '완료',    color: '#10b981' },
  '보류':   { label: '보류',    color: '#ef4444' },
}

const PRIORITY_CONFIG = {
  '긴급': { color: '#ef4444' },
  '높음': { color: '#f97316' },
  '보통': { color: '#3b82f6' },
  '낮음': { color: '#94a3b8' },
}

const getDdayText = (due_date) => {
  if (!due_date) return null
  const diff = Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0)  return { label: `D+${Math.abs(diff)}`, color: 'var(--color-text-muted)' }
  if (diff === 0) return { label: 'D-Day',              color: 'var(--color-status-deadline)' }
  if (diff <= 3)  return { label: `D-${diff}`,          color: 'var(--color-status-deadline)' }
  if (diff <= 7)  return { label: `D-${diff}`,          color: 'var(--color-status-doing)' }
  return              { label: `D-${diff}`,              color: 'var(--color-text-muted)' }
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', '')

const KanbanCard = ({ card, onClick }) => {
  const dday = getDdayText(card.due_date)
  const status = STATUS_CONFIG[card.status]
  const priority = PRIORITY_CONFIG[card.priority]
  const visibleLabels = card.labels?.slice(0, 2) ?? []
  const extraLabels = (card.labels?.length ?? 0) - visibleLabels.length

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
      className="rounded-[10px] p-3 transition-all duration-150 hover:shadow-md hover:-translate-y-[1px]"
    >
      {/* ── 1행: 제목 ── */}
      <div className="flex items-start gap-2 mb-2">
        <CheckSquare
          size={14}
          className="flex-shrink-0 mt-[2px]"
          style={{ color: status?.color ?? 'var(--color-text-muted)' }}
        />
        <p
          className="text-[13px] font-semibold leading-snug flex-1 min-w-0"
          style={{
            color: 'var(--color-text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {card.title}
        </p>
      </div>

      {/* ── 2행: 상태 + 우선순위 + 라벨 ── */}
      <div className="flex items-center gap-1 mb-2 flex-wrap" style={{ marginLeft: '22px' }}>
        {status && (
          <span
            className="h-[17px] px-[6px] rounded-[4px] text-[10px] font-semibold text-white flex-shrink-0"
            style={{ background: status.color }}
          >
            {status.label}
          </span>
        )}
        {priority && (
          <span
            className="h-[17px] px-[6px] rounded-[4px] text-[10px] font-semibold flex-shrink-0"
            style={{
              background: `${priority.color}22`,
              color: priority.color,
              border: `1px solid ${priority.color}55`,
            }}
          >
            {card.priority}
          </span>
        )}
        {visibleLabels.map((label, i) => (
          <span
            key={i}
            className="h-[17px] px-[6px] rounded-[4px] text-[10px] font-medium text-white flex-shrink-0"
            style={{ background: label.color }}
          >
            {label.text}
          </span>
        ))}
        {extraLabels > 0 && (
          <span
            className="h-[17px] px-[6px] rounded-[4px] text-[10px] font-medium flex-shrink-0"
            style={{
              background: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            +{extraLabels}
          </span>
        )}
      </div>

      {/* ── 3행: 기간 + 프로필 ── */}
      <div className="flex items-center justify-between" style={{ marginLeft: '22px' }}>
        <div className="flex items-center gap-1">
          <Calendar size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          {card.start_date && card.due_date ? (
            <span className="text-[11px]" style={{ color: dday?.color ?? 'var(--color-text-muted)' }}>
              {formatDate(card.start_date)} → {formatDate(card.due_date)}
              {dday && <span className="ml-1 font-semibold">({dday.label})</span>}
            </span>
          ) : card.due_date ? (
            <span className="text-[11px]" style={{ color: dday?.color ?? 'var(--color-text-muted)' }}>
              {formatDate(card.due_date)}
              {dday && <span className="ml-1 font-semibold">({dday.label})</span>}
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              기한 없음
            </span>
          )}
        </div>

        {/* 프로필 */}
        {card.owner_id?.profile_img && card.owner_id.profile_img !== 'default_profile.png' ? (
          <img
            src={`${import.meta.env.VITE_API_URL}${card.owner_id.profile_img}`}
            alt=""
            className="w-[22px] h-[22px] rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white"
            style={{ background: 'var(--color-brand)' }}
          >
            {card.owner_id?.nickname?.[0] ?? 'U'}
          </div>
        )}
      </div>

    </div>
  )
}

export default KanbanCard