import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import Modal from '../common/Modal'

// 카드 모델 status enum: '대기' | '진행중' | '완료' | '보류'
const STATUSES = [
  { id: '대기',   name: '대기',   color: 'var(--color-status-todo)' },
  { id: '진행중', name: '진행 중', color: 'var(--color-status-doing)' },
  { id: '완료',   name: '완료',   color: 'var(--color-status-done)' },
  { id: '보류',   name: '보류',   color: 'var(--color-status-hold)' },
]

// 카드 모델 labels: [{ color, text }] — text 기준으로 필터
const LABEL_OPTIONS = [
  { id: 'Design',        color: '#3b82f6' },
  { id: 'Dev',           color: '#10b981' },
  { id: 'Marketing',     color: '#f59e0b' },
  { id: 'Planning',      color: '#8b5cf6' },
  { id: 'QA',            color: '#ef4444' },
  { id: 'Backend',       color: '#6366f1' },
  { id: 'Frontend',      color: '#0ea5e9' },
  { id: 'Design System', color: '#ec4899' },
  { id: 'Docs',          color: '#14b8a6' },
  { id: 'Infra',         color: '#f97316' },
]

const DEADLINES = [
  { id: 'today', name: '오늘까지' },
  { id: 'week',  name: '이번 주까지' },
  { id: 'month', name: '이번 달까지' },
]

const FilterModal = ({ isOpen, onClose, onApply, initialFilter = {} }) => {
  const [selectedLabels,   setSelectedLabels]   = useState(initialFilter.labels   ?? [])
  const [selectedStatuses, setSelectedStatuses] = useState(initialFilter.statuses ?? [])
  const [selectedDeadline, setSelectedDeadline] = useState(initialFilter.deadline ?? null)

  const toggleLabel = (id) =>
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )

  const toggleStatus = (id) =>
    setSelectedStatuses(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )

  const handleReset = () => {
    setSelectedLabels([])
    setSelectedStatuses([])
    setSelectedDeadline(null)
  }

  const handleApply = () => {
    onApply?.({ labels: selectedLabels, statuses: selectedStatuses, deadline: selectedDeadline })
    onClose()
  }

  const isActive = selectedLabels.length > 0 || selectedStatuses.length > 0 || selectedDeadline
  const filterCount = selectedLabels.length + selectedStatuses.length + (selectedDeadline ? 1 : 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <div className="p-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={17} style={{ color: 'var(--color-text-primary)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              필터
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            ✕
          </button>
        </div>

        {/* 라벨 */}
        <section className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3"
             style={{ color: 'var(--color-text-muted)' }}>
            라벨
          </p>
          <div className="flex flex-wrap gap-2">
            {LABEL_OPTIONS.map(label => {
              const active = selectedLabels.includes(label.id)
              return (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                             border transition-all duration-150"
                  style={active
                    ? { backgroundColor: label.color, borderColor: label.color, color: 'white' }
                    : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.8)' : label.color }}
                  />
                  {label.id}
                </button>
              )
            })}
          </div>
        </section>

        <div className="h-px mb-5" style={{ background: 'var(--color-border)' }} />

        {/* 상태 */}
        <section className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3"
             style={{ color: 'var(--color-text-muted)' }}>
            상태
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(status => {
              const active = selectedStatuses.includes(status.id)
              return (
                <button
                  key={status.id}
                  onClick={() => toggleStatus(status.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                             border transition-all duration-150"
                  style={active
                    ? { backgroundColor: status.color, borderColor: status.color, color: 'white' }
                    : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.8)' : status.color }}
                  />
                  {status.name}
                </button>
              )
            })}
          </div>
        </section>

        <div className="h-px mb-5" style={{ background: 'var(--color-border)' }} />

        {/* 마감일 */}
        <section className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3"
             style={{ color: 'var(--color-text-muted)' }}>
            마감일
          </p>
          <div className="flex gap-2">
            {DEADLINES.map(d => {
              const active = selectedDeadline === d.id
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeadline(active ? null : d.id)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all duration-150"
                  style={active
                    ? { background: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: 'white' }
                    : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                  }
                >
                  {d.name}
                </button>
              )
            })}
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!isActive}
            className="flex-1 h-10 rounded-lg text-sm font-medium border transition-colors
                       disabled:opacity-40 disabled:pointer-events-none"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-10 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--color-brand)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-brand-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-brand)'}
          >
            적용
            {isActive && (
              <span className="ml-1.5 inline-flex items-center justify-center
                               w-4 h-4 rounded-full bg-white/25 text-[10px] font-bold">
                {filterCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </Modal>
  )
}

export default FilterModal