import { Check, ChevronRight, Trash2 } from 'lucide-react'

const CATEGORY_MAP = {
  DEADLINE: { label: '마감 임박', color: 'var(--color-status-deadline)' },
  UPDATE:   { label: '업데이트', color: 'var(--color-brand)' },
  SYSTEM:   { label: '시스템',   color: 'var(--color-text-muted)' },
  COMMENT:  { label: '댓글',     color: 'var(--color-status-doing)' },
}

const NotiItem = ({ noti, onNavigate, onReadOne, onRemove }) => {
  const cat = CATEGORY_MAP[noti.category] ?? { label: noti.category, color: 'var(--color-text-muted)' }

  return (
    <div
      className="relative flex items-start gap-4 px-5 py-4 rounded-xl transition-all overflow-hidden"
      style={{
        background: noti.is_read ? 'var(--color-surface-2)' : 'rgba(45,64,142,0.05)',
        border: `1px solid ${noti.is_read ? 'var(--color-border)' : 'rgba(45,64,142,0.18)'}`,
      }}
    >
      {!noti.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: cat.color }} />
      )}
      <div className="mt-1 shrink-0 ml-1">
        <div className="w-2 h-2 rounded-full transition-colors" style={{ background: noti.is_read ? 'var(--color-border)' : cat.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${cat.color}18`, color: cat.color }}>
            {cat.label}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(noti.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-[14px] font-semibold mb-0.5" style={{ color: noti.is_read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
          {noti.title}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>{noti.content}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {noti.link_url && (
          <button onClick={() => onNavigate(noti)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-brand)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
            title="바로가기"
          >
            <ChevronRight size={16} />
          </button>
        )}
        {!noti.is_read && (
          <button onClick={() => onReadOne(noti._id)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-brand)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
            title="읽음 표시"
          >
            <Check size={15} />
          </button>
        )}
        <button onClick={() => onRemove(noti._id)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--color-status-deadline)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          title="삭제"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default NotiItem