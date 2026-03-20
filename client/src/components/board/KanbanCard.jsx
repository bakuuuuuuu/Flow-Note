import { Calendar } from 'lucide-react'

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

  return (
    <div
      onClick={() => onClick?.(card)}
      className="rounded-[8px] p-4 cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-[1px]"
      style={{
        background: 'var(--color-surface)',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* ── 상단: 아이콘 + 제목 + 라벨 ── */}
      <div className="mb-3">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-[14px] mt-[2px]">📋</span>
          <p
            className="text-[14px] font-semibold leading-snug"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {card.title}
          </p>
        </div>
        {card.labels && card.labels.length > 0 && (
          <p
            className="text-[12px] ml-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {card.labels[0].text}
          </p>
        )}
        {/* 라벨 없으면 priority 표시 */}
        {(!card.labels || card.labels.length === 0) && card.priority && (
          <p
            className="text-[12px] ml-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {card.priority}
          </p>
        )}
      </div>

      {/* ── 하단: D-day + 프로필 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
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
        </div>

        {/* 프로필 */}
        <div
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{
            background: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          {card.owner_id?.nickname?.[0] ?? 'U'}
        </div>
      </div>
    </div>
  )
}

export default KanbanCard