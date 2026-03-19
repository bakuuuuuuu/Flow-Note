import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'
import Modal from './Modal'
import useBoardStore from '../../store/boardStore'
import { CATEGORIES } from '../../constants/categories'

const NewBoardModal = ({ isOpen, onClose, onSuccess }) => {
  const { addBoard } = useBoardStore()

  const [form, setForm] = useState({
    title: '',
    category: CATEGORIES[0].label,
    categoryEmoji: CATEGORIES[0].emoji,
    deadline: null,
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({ ...prev, category: cat.label, categoryEmoji: cat.emoji }))
    setDropdownOpen(false)
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.title.trim()) {
      setError('보드 이름을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      const newBoard = await addBoard({
        title: form.title.trim(),
        category: form.category,
        deadline: form.deadline ? form.deadline.toISOString() : null,
      })
      setForm({ title: '', category: CATEGORIES[0].label, categoryEmoji: CATEGORIES[0].emoji, deadline: null })
      onClose()
      if (onSuccess) onSuccess(newBoard)
    } catch {
      setError('보드 생성에 실패했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({ title: '', category: CATEGORIES[0].label, categoryEmoji: CATEGORIES[0].emoji, deadline: null })
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
          <label
            className="block text-[15px] font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
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
          <label
            className="block text-[15px] font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
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

            {/* 드롭다운 */}
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

        {/* ── 마감일 ── */}
        <div className="mb-6">
          <label
            className="block text-[15px] font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            마감일
          </label>
          <DatePicker
            selected={form.deadline}
            onChange={(date) => setForm((prev) => ({ ...prev, deadline: date }))}
            minDate={new Date()}
            locale={ko}
            dateFormat="yyyy년 MM월 dd일"
            placeholderText="날짜를 선택하세요"
            wrapperClassName="w-full"
            onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
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