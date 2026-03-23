import { useState, useEffect } from 'react'
import { ChevronDown, Plus, X, Pencil, Check } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'
import Modal from './Modal'
import useBoardStore from '../../store/boardStore'
import useListStore from '../../store/listStore'
import { CATEGORIES } from '../../constants/categories'
import toast from 'react-hot-toast'

const MAX_LISTS = 10

const EditBoardModal = ({ isOpen, onClose, board, onSuccess }) => {
  const { editBoard } = useBoardStore()
  const { lists, addList, editList, removeList } = useListStore()

  const [form, setForm] = useState({
    title: '',
    category: CATEGORIES[0].label,
    categoryEmoji: CATEGORIES[0].emoji,
    startDate: null,
    deadline: null,
  })
  const [localLists, setLocalLists] = useState([])
  const [editingListId, setEditingListId] = useState(null)
  const [editingListTitle, setEditingListTitle] = useState('')
  const [newListTitle, setNewListTitle] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (board && isOpen) {
      const cat = CATEGORIES.find((c) => c.label === board.category) ?? CATEGORIES[0]
      setForm({
        title: board.title ?? '',
        category: cat.label,
        categoryEmoji: cat.emoji,
        startDate: board.start_date ? new Date(board.start_date) : null,
        deadline: board.deadline ? new Date(board.deadline) : null,
      })
      setLocalLists(lists.map((l) => ({ ...l })))
      setEditingListId(null)
      setNewListTitle('')
      setDeleteConfirmId(null)
    }
  }, [board, isOpen, lists])

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({ ...prev, category: cat.label, categoryEmoji: cat.emoji }))
    setDropdownOpen(false)
  }

  // ── 리스트 이름 수정 ──
  const handleEditListStart = (list) => {
    setEditingListId(list._id)
    setEditingListTitle(list.title)
  }

  const handleEditListSave = async (id) => {
    if (!editingListTitle.trim()) return
    try {
      await editList(id, { title: editingListTitle.trim() })
      setEditingListId(null)
      toast.success('리스트 이름이 변경됐어요')
    } catch {
      toast.error('리스트 이름 변경에 실패했어요.')
    }
  }

  // ── 리스트 추가 ──
  const handleAddList = async () => {
    if (!newListTitle.trim()) return
    if (lists.length >= MAX_LISTS) {
      toast.error(`리스트는 최대 ${MAX_LISTS}개까지 만들 수 있어요.`)
      return
    }
    try {
      await addList({ title: newListTitle.trim(), board_id: board._id })
      setNewListTitle('')
      toast.success('리스트가 추가됐어요 ✅')
    } catch {
      toast.error('리스트 추가에 실패했어요.')
    }
  }

  // ── 리스트 삭제 ──
  const handleDeleteList = async (id) => {
    try {
      await removeList(id)
      setDeleteConfirmId(null)
      toast.success('리스트가 삭제됐어요 🗑️')
    } catch {
      toast.error('리스트 삭제에 실패했어요.')
    }
  }

  // ── 보드 정보 저장 ──
  const handleSubmit = async () => {
    setError('')
    if (!form.title.trim()) {
      setError('보드 이름을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      await editBoard(board._id, {
        title: form.title.trim(),
        category: form.category,
        start_date: form.startDate ? form.startDate.toISOString() : null,
        deadline: form.deadline ? form.deadline.toISOString() : null,
      })
      toast.success('보드가 수정됐어요 ✏️')
      handleClose()
      if (onSuccess) onSuccess()
    } catch {
      setError('보드 수정에 실패했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setDropdownOpen(false)
    setEditingListId(null)
    setNewListTitle('')
    setDeleteConfirmId(null)
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
          보드 수정
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

        {/* ── 기간 설정 ── */}
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

        {/* ── 리스트 관리 ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[15px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              리스트 관리
            </label>
            <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              {lists.length}/{MAX_LISTS}
            </span>
          </div>

          {/* 기존 리스트 목록 */}
          <div
            className="flex flex-col gap-2 overflow-y-auto pr-1 mb-2"
            style={{ maxHeight: '180px' }}
          >
            {lists.map((list) => (
              <div key={list._id} className="flex items-center gap-2">
                {editingListId === list._id ? (
                  <>
                    <input
                      type="text"
                      value={editingListTitle}
                      onChange={(e) => setEditingListTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleEditListSave(list._id) }}
                      autoFocus
                      className="flex-1 h-[44px] px-4 rounded-[10px] text-[14px] outline-none transition-colors"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-brand)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleEditListSave(list._id)}
                      className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] flex-shrink-0 transition-colors"
                      style={{
                        background: 'var(--color-brand)',
                        color: 'white',
                      }}
                    >
                      <Check size={16} />
                    </button>
                  </>
                ) : deleteConfirmId === list._id ? (
                  <>
                    <div
                      className="flex-1 h-[44px] px-4 rounded-[10px] text-[14px] flex items-center"
                      style={{
                        background: 'rgba(224, 49, 49, 0.08)',
                        border: '1px solid var(--color-status-deadline)',
                        color: 'var(--color-status-deadline)',
                      }}
                    >
                      카드도 함께 삭제돼요. 정말 삭제할까요?
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteList(list._id)}
                      className="h-[44px] px-3 rounded-[10px] text-[13px] font-medium flex-shrink-0 text-white transition-colors"
                      style={{ background: 'var(--color-status-deadline)' }}
                    >
                      삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="h-[44px] px-3 rounded-[10px] text-[13px] font-medium flex-shrink-0 transition-colors"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="flex-1 h-[44px] px-4 rounded-[10px] text-[14px] flex items-center"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {list.title}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditListStart(list)}
                      className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] flex-shrink-0 transition-colors"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(list._id)}
                      disabled={lists.length <= 1}
                      className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] flex-shrink-0 transition-colors"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: lists.length <= 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
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
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 새 리스트 추가 */}
          {lists.length < MAX_LISTS && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="새 리스트 이름"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddList() }}
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
                onClick={handleAddList}
                className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] flex-shrink-0 transition-colors"
                style={{
                  background: 'var(--color-brand)',
                  color: 'white',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-brand-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-brand)'}
              >
                <Plus size={18} />
              </button>
            </div>
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
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>

      </div>
    </Modal>
  )
}

export default EditBoardModal