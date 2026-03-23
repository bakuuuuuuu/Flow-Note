import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'
import Modal from '../common/Modal'
import useCardStore from '../../store/cardStore'
import useListStore from '../../store/listStore'
import toast from 'react-hot-toast'

const LABEL_OPTIONS = [
  { color: '#ef4444', text: 'Design' },
  { color: '#3b82f6', text: 'Dev' },
  { color: '#10b981', text: 'Marketing' },
  { color: '#f59e0b', text: 'Planning' },
  { color: '#8b5cf6', text: 'QA' },
  { color: '#f97316', text: 'Backend' },
  { color: '#06b6d4', text: 'Frontend' },
  { color: '#ec4899', text: 'Design System' },
  { color: '#64748b', text: 'Docs' },
  { color: '#84cc16', text: 'Infra' },
]

const TITLE_MAX = 100
const CONTENT_MAX = 2000

const NewCardModal = ({ isOpen, onClose, listId, boardId, onSuccess }) => {
  const { addCard } = useCardStore()
  const { lists } = useListStore()

  const [form, setForm] = useState({
    title: '',
    content: '',
    list_id: listId,
    start_date: null,
    due_date: null,
    selectedLabels: [],
  })
  const [listOpen, setListOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedList = lists.find((l) => l._id === form.list_id)

  const handleToggleLabel = (label) => {
    setForm((prev) => {
      const exists = prev.selectedLabels.find((l) => l.color === label.color)
      return {
        ...prev,
        selectedLabels: exists
          ? prev.selectedLabels.filter((l) => l.color !== label.color)
          : [...prev.selectedLabels, label],
      }
    })
  }

  const handleSubmit = async () => {
  setError('')
  if (!form.title.trim()) {
    setError('카드 제목을 입력해주세요.')
    return
  }
  if (form.start_date && form.due_date && form.start_date > form.due_date) {
    setError('마감일은 시작일보다 늦어야 해요.')
    return
  }
  setLoading(true)
  try {
    const newCard = await addCard({
      title: form.title.trim(),
      content: form.content.trim(),
      list_id: form.list_id,
      board_id: boardId,
      due_date: form.due_date ? form.due_date.toISOString() : null,
      labels: form.selectedLabels,
    }, useListStore)
    toast.success('카드가 추가됐어요 ✅')
    handleClose()
    if (onSuccess) onSuccess(newCard)
  } catch {
    toast.error('카드 생성에 실패했어요.')
    setError('카드 생성에 실패했어요. 다시 시도해주세요.')
  } finally {
    setLoading(false)
  }
}

  const handleClose = () => {
    setForm({ title: '', content: '', list_id: listId, start_date: null, due_date: null, selectedLabels: [] })
    setError('')
    setListOpen(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[540px]">
      <div className="flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* ── 타이틀 — 상단 고정 ── */}
        <div className="px-8 pt-8 pb-4 flex-shrink-0">
          <h2
            className="text-[28px] font-bold"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.6px' }}
          >
            새 카드 추가
          </h2>
        </div>

        {/* ── 스크롤 영역 ── */}
        <div className="flex-1 overflow-y-auto px-8 pb-2">

          {/* ── 카드 제목 ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                할 일 제목 <span style={{ color: 'var(--color-status-deadline)' }}>*</span>
              </label>
              <span
                className="text-[12px]"
                style={{ color: form.title.length >= 90 ? 'var(--color-status-deadline)' : 'var(--color-text-muted)' }}
              >
                {form.title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              maxLength={TITLE_MAX}
              className="w-full h-[52px] px-4 rounded-[10px] text-[15px] outline-none transition-colors"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* ── 설명 ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                설명
              </label>
              <span
                className="text-[12px]"
                style={{ color: form.content.length >= 1800 ? 'var(--color-status-deadline)' : 'var(--color-text-muted)' }}
              >
                {form.content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              placeholder="내용을 입력하세요"
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              maxLength={CONTENT_MAX}
              rows={6}
              className="w-full px-4 py-3 rounded-[10px] text-[14px] outline-none transition-colors resize-none"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* ── 리스트 선택 ── */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              리스트
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setListOpen((v) => !v)}
                className="w-full h-[52px] px-4 rounded-[10px] text-[14px] flex items-center justify-between transition-colors cursor-pointer"
                style={{
                  background: 'var(--color-surface-2)',
                  border: `1px solid ${listOpen ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
              >
                <span>{selectedList?.title ?? '리스트 선택'}</span>
                <ChevronDown
                  size={16}
                  style={{
                    color: 'var(--color-text-muted)',
                    transform: listOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
              {listOpen && (
                <div
                  className="absolute top-[54px] left-0 right-0 rounded-[10px] overflow-y-auto z-10"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    maxHeight: '220px',
                  }}
                >
                  {lists.map((list) => (
                    <button
                      key={list._id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, list_id: list._id }))
                        setListOpen(false)
                      }}
                      className="w-full h-[44px] px-4 flex items-center text-[14px] transition-colors"
                      style={{
                        color: form.list_id === list._id ? 'var(--color-brand)' : 'var(--color-text-primary)',
                        fontWeight: form.list_id === list._id ? 600 : 400,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {list.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 시작일 + 마감일 ── */}
          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  시작일
                </span>
              </label>
              <DatePicker
                selected={form.start_date}
                onChange={(date) => setForm((prev) => ({ ...prev, start_date: date }))}
                selectsStart
                startDate={form.start_date}
                endDate={form.due_date}
                locale={ko}
                dateFormat="yyyy.MM.dd"
                placeholderText="시작일 선택"
                wrapperClassName="w-full"
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  마감일
                </span>
              </label>
              <DatePicker
                selected={form.due_date}
                onChange={(date) => setForm((prev) => ({ ...prev, due_date: date }))}
                selectsEnd
                startDate={form.start_date}
                endDate={form.due_date}
                minDate={form.start_date}
                locale={ko}
                dateFormat="yyyy.MM.dd"
                placeholderText="마감일 선택"
                wrapperClassName="w-full"
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
          </div>

          {/* ── 라벨 태그 ── */}
          <div className="mb-4">
            <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              라벨
            </label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((label) => {
                const selected = form.selectedLabels.find((l) => l.color === label.color)
                return (
                  <button
                    key={label.color}
                    type="button"
                    onClick={() => handleToggleLabel(label)}
                    className="h-[30px] px-3 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background: selected ? label.color : 'var(--color-surface-2)',
                      color: selected ? 'white' : 'var(--color-text-secondary)',
                      border: `1px solid ${selected ? label.color : 'var(--color-border)'}`,
                    }}
                  >
                    {label.text}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 에러 */}
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* ── 버튼 — 하단 고정 ── */}
        <div
          className="px-8 py-5 flex justify-end gap-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="h-[48px] w-[120px] rounded-[10px] text-[15px] font-medium transition-all cursor-pointer"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-2)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-[48px] w-[120px] rounded-[10px] text-[15px] font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: 'var(--color-brand)',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-brand)' }}
          >
            {loading ? '추가 중...' : '+ 추가'}
          </button>
        </div>

      </div>
    </Modal>
  )
}

export default NewCardModal