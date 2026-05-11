import { useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'
import Modal from '../common/Modal'
import useBoardStore from '../../store/boardStore'
import { CATEGORIES } from '../../constants/categories'

const DEFAULT_LISTS = ['할 일', '진행 중', '완료']
const MAX_LISTS = 10

const NewBoardModal = ({ isOpen, onClose, onSuccess }) => {
  const { addBoard } = useBoardStore()

  const [form, setForm] = useState({
    title: '',
    category: CATEGORIES[0].label,
    categoryEmoji: CATEGORIES[0].emoji,
    startDate: null,
    deadline: null,
  })
  const [lists, setLists] = useState([...DEFAULT_LISTS])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({ ...prev, category: cat.label, categoryEmoji: cat.emoji }))
    setDropdownOpen(false)
  }

  const handleListChange = (index, value) => {
    setLists((prev) => prev.map((l, i) => i === index ? value : l))
  }

  const handleAddList = () => {
    if (lists.length >= MAX_LISTS) return
    setLists((prev) => [...prev, ''])
  }

  const handleRemoveList = (index) => {
    if (lists.length <= 1) return
    setLists((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.title.trim()) {
      setError('보드 이름을 입력해주세요.')
      return
    }
    const filteredLists = lists.map((l) => l.trim()).filter(Boolean)
    if (filteredLists.length === 0) {
      setError('리스트를 최소 1개 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      const newBoard = await addBoard({
        title: form.title.trim(),
        category: form.category,
        start_date: form.startDate ? form.startDate.toISOString() : null,
        deadline: form.deadline ? form.deadline.toISOString() : null,
        lists: filteredLists,
      })
      handleClose()
      if (onSuccess) onSuccess(newBoard)
    } catch {
      setError('보드 생성에 실패했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({
      title: '',
      category: CATEGORIES[0].label,
      categoryEmoji: CATEGORIES[0].emoji,
      startDate: null,
      deadline: null,
    })
    setLists([...DEFAULT_LISTS])
    setError('')
    setDropdownOpen(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[560px]">
      <div className="p-8">

        {/* ── 타이틀 ── */}
        <h2
          className="text-[32px] font-bold mb-6"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.6px' }}
        >
          새 보드 만들기
        </h2>

        {/* ── 보드 이름 ── */}
        <div className="mb-5">
          <label className="block text-[15px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            보드 이름
          </label>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
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

        {/* ── 카테고리 ── */}
        <div className="mb-5">
          <label className="block text-[15px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            카테고리
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full h-[52px] px-4 rounded-[10px] text-[15px] flex items-center justify-between transition-colors cursor-pointer"
              style={{
                background: 'var(--color-surface-2)',
                border: `1px solid ${dropdownOpen ? 'var(--color-brand)' : 'var(--color-border)'}`,
                color: 'var(--color-text-primary)',
              }}
            >
              <span className="flex items-center gap-3">
                <span className="text-[20px]">{form.categoryEmoji}</span>
                <span>{form.category}</span>
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: 'var(--color-text-muted)',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>
            {dropdownOpen && (
              <div
                className="absolute top-[54px] left-0 right-0 rounded-[10px] overflow-y-auto z-10"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  maxHeight: '220px',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full h-[44px] px-4 flex items-center gap-3 text-[14px] transition-colors text-left"
                    style={{ color: 'var(--color-text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-[18px]">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 기간 설정 (시작일 ~ 마감일) ── */}
        <div className="mb-5">
          <label className="block text-[15px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            기간
          </label>
          <DatePicker
            selectsRange
            startDate={form.startDate}
            endDate={form.deadline}
            onChange={([start, end]) =>
              setForm((prev) => ({ ...prev, startDate: start, deadline: end }))
            }
            locale={ko}
            dateFormat="yyyy.MM.dd"
            placeholderText="시작일 - 마감일 선택"
            wrapperClassName="w-full"
            onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* ── 리스트 ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[15px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              리스트
            </label>
            <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              {lists.length}/{MAX_LISTS}
            </span>
          </div>

          <div
            className="flex flex-col gap-2 overflow-y-auto pr-1"
            style={{ maxHeight: '180px' }}
          >
            {lists.map((list, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`리스트 ${index + 1}`}
                  value={list}
                  onChange={(e) => handleListChange(index, e.target.value)}
                  className="flex-1 h-[44px] px-4 rounded-[10px] text-[14px] outline-none transition-colors"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveList(index)}
                  disabled={lists.length <= 1}
                  className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] transition-colors flex-shrink-0"
                  style={{
                    color: lists.length <= 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    cursor: lists.length <= 1 ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (lists.length > 1) e.currentTarget.style.color = 'var(--color-status-deadline)'
                  }}
                  onMouseLeave={(e) => {
                    if (lists.length > 1) e.currentTarget.style.color = 'var(--color-text-muted)'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {lists.length < MAX_LISTS && (
            <button
              type="button"
              onClick={handleAddList}
              className="w-full h-[44px] flex items-center justify-center gap-2 rounded-[10px] text-[14px] font-medium transition-colors border border-dashed mt-2"
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
              <Plus size={16} />
              리스트 추가
            </button>
          )}
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* ── 버튼 ── */}
        <div className="flex justify-end gap-3">
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
            className="h-[48px] w-[120px] rounded-[10px] text-[15px] font-semibold text-white transition-all cursor-pointer"
            style={{
              background: 'var(--color-brand)',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-brand)' }}
          >
            {loading ? '추가 중...' : '추가'}
          </button>
        </div>

      </div>
    </Modal>
  )
}

export default NewBoardModal