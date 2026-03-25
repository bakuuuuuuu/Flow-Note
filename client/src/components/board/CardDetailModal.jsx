import { useState, useEffect, useRef } from 'react'
import { Calendar, Trash2, Paperclip, ChevronRight, ChevronDown } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'
import Modal from '../common/Modal'
import useCardStore from '../../store/cardStore'
import useListStore from '../../store/listStore'
import toast from 'react-hot-toast'
import { uploadCardAttachments, deleteCardAttachment } from '../../api/cardApi'

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

const STATUS_OPTIONS = [
  { value: '대기',   label: '할 일',   color: '#94a3b8' },
  { value: '진행중', label: '진행 중', color: '#f59e0b' },
  { value: '완료',   label: '완료',    color: '#10b981' },
  { value: '보류',   label: '보류',    color: '#ef4444' },
]

const PRIORITY_OPTIONS = [
  { value: '긴급', color: '#ef4444' },
  { value: '높음', color: '#f97316' },
  { value: '보통', color: '#3b82f6' },
  { value: '낮음', color: '#94a3b8' },
]

const TITLE_MAX = 100
const CONTENT_MAX = 2000

const getDdayText = (due_date) => {
  if (!due_date) return null
  const diff = Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0)  return { label: `D+${Math.abs(diff)}`, color: 'var(--color-status-deadline)' }
  if (diff === 0) return { label: 'D-Day',              color: 'var(--color-status-deadline)' }
  if (diff <= 3)  return { label: `D-${diff}`,          color: 'var(--color-status-deadline)' }
  if (diff <= 7)  return { label: `D-${diff}`,          color: 'var(--color-status-doing)' }
  return              { label: `D-${diff}`,              color: 'var(--color-text-muted)' }
}

const CardDetailModal = ({ isOpen, onClose, card, boardTitle }) => {
  const { fetchCardById, editCard, removeCard } = useCardStore()
  const listStore = useListStore
  const { lists } = useListStore()
  const fileInputRef = useRef(null)

  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    status: '대기',
    priority: '보통',
    list_id: '',
    start_date: null,
    due_date: null,
    selectedLabels: [],
  })
  const [listOpen, setListOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [error, setError] = useState('')

  const currentList = lists.find((l) => l._id === form.list_id)
    ?? lists.find((l) => l.cards?.some((c) => c._id === card?._id))

  useEffect(() => {
    if (!isOpen || !card?._id) return
    const load = async () => {
      try {
        const data = await fetchCardById(card._id)
        setDetail(data)
        const cardList = lists.find((l) => l.cards?.some((c) => c._id === card._id))
        setForm({
          title: data.title ?? '',
          content: data.content ?? '',
          status: data.status ?? '대기',
          priority: data.priority ?? '보통',
          list_id: cardList?._id ?? data.list_id ?? '',
          start_date: data.start_date ? new Date(data.start_date) : null,
          due_date: data.due_date ? new Date(data.due_date) : null,
          selectedLabels: data.labels ?? [],
        })
      } catch {
        toast.error('카드 정보를 불러오는데 실패했어요.')
      }
    }
    load()
  }, [isOpen, card?._id])

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
    setLoading(true)
    try {
      await editCard(card._id, {
        title: form.title.trim(),
        content: form.content.trim(),
        status: form.status,
        priority: form.priority,
        list_id: form.list_id,
        start_date: form.start_date ? form.start_date.toISOString() : null,
        due_date: form.due_date ? form.due_date.toISOString() : null,
        labels: form.selectedLabels,
      }, listStore)
      toast.success('카드가 수정됐어요 ✅')
      handleClose()
    } catch (err) {
      console.error('수정 에러:', err.response?.data)
      toast.error('카드 수정에 실패했어요.')
      setError('카드 수정에 실패했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await removeCard(card._id, currentList?._id, listStore)
      toast.success('카드가 삭제됐어요 🗑️')
      handleClose()
    } catch {
      toast.error('카드 삭제에 실패했어요.')
    } finally {
      setDeleteLoading(false)
      setDeleteConfirm(false)
    }
  }

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append('attachments', f))
    setFileLoading(true)
    try {
      const { data } = await uploadCardAttachments(card._id, formData)
      setDetail((prev) => ({ ...prev, attachments: data.attachments }))
      toast.success('파일이 업로드됐어요 📎')
    } catch {
      toast.error('파일 업로드에 실패했어요.')
    } finally {
      setFileLoading(false)
      e.target.value = ''
    }
  }

  const handleFileDelete = async (attachmentId) => {
    try {
      const { data } = await deleteCardAttachment(card._id, attachmentId)
      setDetail((prev) => ({ ...prev, attachments: data.attachments }))
      toast.success('파일이 삭제됐어요')
    } catch {
      toast.error('파일 삭제에 실패했어요.')
    }
  }

  const handleClose = () => {
    setDetail(null)
    setDeleteConfirm(false)
    setListOpen(false)
    setError('')
    onClose()
  }

  const dday = getDdayText(form.due_date)

  if (!card) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[600px]">
      <div className="flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* ── 헤더 — 상단 고정 ── */}
        <div className="px-8 pt-8 pb-4 flex-shrink-0">

          {/* breadcrumb */}
          <div className="flex items-center gap-1 mb-3 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            <span>{boardTitle ?? '보드'}</span>
            <ChevronRight size={12} />
            <span>{currentList?.title ?? '리스트'}</span>
          </div>

          {/* 제목 */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              할 일 제목
              <span style={{ color: 'var(--color-status-deadline)' }}> *</span>
            </span>
            <span
              className="text-[12px]"
              style={{ color: form.title.length >= 90 ? 'var(--color-status-deadline)' : 'var(--color-text-muted)' }}
            >
              {form.title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            maxLength={TITLE_MAX}
            placeholder="카드 제목을 입력하세요"
            className="w-full h-[48px] px-4 rounded-[10px] text-[16px] font-semibold outline-none transition-colors"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* ── 스크롤 영역 ── */}
        <div className="flex-1 overflow-y-auto px-8 pb-2">

          {/* 상태 + 우선순위 */}
          <div className="mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s.value }))}
                  className="h-[28px] px-3 rounded-full text-[12px] font-medium transition-all flex items-center gap-1"
                  style={{
                    background: form.status === s.value ? s.color : 'var(--color-surface-2)',
                    color: form.status === s.value ? 'white' : 'var(--color-text-muted)',
                    border: `1px solid ${form.status === s.value ? s.color : 'var(--color-border)'}`,
                  }}
                >
                  <span
                    className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                    style={{ background: form.status === s.value ? 'white' : s.color }}
                  />
                  {s.label}
                </button>
              ))}
              <div className="w-[1px] h-[16px] mx-1" style={{ background: 'var(--color-border)' }} />
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                  className="h-[28px] px-3 rounded-full text-[12px] font-medium transition-all"
                  style={{
                    background: form.priority === p.value ? p.color : 'var(--color-surface-2)',
                    color: form.priority === p.value ? 'white' : 'var(--color-text-muted)',
                    border: `1px solid ${form.priority === p.value ? p.color : 'var(--color-border)'}`,
                  }}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* 리스트 변경 드롭다운 */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              리스트
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setListOpen((v) => !v)}
                className="w-full h-[48px] px-4 rounded-[10px] text-[14px] flex items-center justify-between transition-colors cursor-pointer"
                style={{
                  background: 'var(--color-surface-2)',
                  border: `1px solid ${listOpen ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
              >
                <span>{currentList?.title ?? '리스트 선택'}</span>
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
                  className="absolute top-[50px] left-0 right-0 rounded-[10px] overflow-y-auto z-10"
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

          {/* 설명 */}
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
              rows={5}
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

          {/* 기간 */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                기간
              </span>
            </label>
            <div className="flex items-center gap-3">
              <DatePicker
                selectsRange
                startDate={form.start_date}
                endDate={form.due_date}
                onChange={([start, end]) =>
                  setForm((prev) => ({ ...prev, start_date: start, due_date: end }))
                }
                locale={ko}
                dateFormat="yyyy.MM.dd"
                placeholderText="시작일 - 마감일 선택"
                wrapperClassName="flex-1"
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
              {dday && (
                <span
                  className="h-[32px] px-3 rounded-full text-[13px] font-bold flex items-center flex-shrink-0 text-white"
                  style={{ background: dday.color }}
                >
                  {dday.label}
                </span>
              )}
            </div>
          </div>

          {/* 라벨 */}
          <div className="mb-5">
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
                    className="h-[28px] px-3 rounded-full text-[12px] font-medium transition-all"
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

          {/* 첨부 파일 */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              첨부 파일
            </label>
            {detail?.attachments && detail.attachments.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                {detail.attachments.map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center gap-3 px-4 h-[44px] rounded-[10px]"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Paperclip size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    {/* 파일명 클릭 시 다운로드 */}
                    <a
                      href={`http://localhost:5000${file.fileUrl}`}
                      download={file.fileName}
                      className="flex-1 text-[13px] truncate transition-colors"
                      style={{ color: 'var(--color-brand)' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {file.fileName}
                    </a>
                    <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                      {(file.fileSize / 1024).toFixed(1)}KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFileDelete(file._id)}
                      className="flex-shrink-0 text-[11px] transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-status-deadline)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={fileLoading}
              className="flex items-center gap-2 h-[44px] px-4 rounded-[10px] text-[13px] font-medium cursor-pointer transition-colors border border-dashed w-full"
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
              <Paperclip size={14} />
              <span>{fileLoading ? '업로드 중...' : '파일 선택'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={fileLoading}
            />
          </div>

          {/* 활동 기록 */}
          {detail?.activities && detail.activities.length > 0 && (
            <div className="mb-4">
              <label className="block text-[14px] font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                활동 기록
              </label>
              <div
                className="rounded-[10px] overflow-hidden"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                  {detail.activities.map((act, i) => (
                    <div
                      key={act._id ?? i}
                      className="flex items-start gap-3 px-4 py-3"
                      style={{
                        borderBottom: i < detail.activities.length - 1
                          ? '1px solid var(--color-border)'
                          : 'none',
                      }}
                    >
                      <div
                        className="w-[8px] h-[8px] rounded-full flex-shrink-0 mt-[6px]"
                        style={{ background: 'var(--color-text-muted)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                          {act.details}
                        </p>
                        <p className="text-[11px] mt-[2px]" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(act.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm mb-2">{error}</p>
          )}
        </div>

        {/* ── 하단 버튼 — 고정 ── */}
        <div
          className="px-8 py-5 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                정말 삭제할까요?
              </span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="h-[36px] px-4 rounded-[8px] text-[13px] font-medium text-white transition-all"
                style={{ background: 'var(--color-status-deadline)', opacity: deleteLoading ? 0.6 : 1 }}
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="h-[36px] px-4 rounded-[8px] text-[13px] font-medium transition-all"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 h-[36px] px-4 rounded-[8px] text-[13px] font-medium transition-all"
              style={{
                color: 'var(--color-status-deadline)',
                border: '1px solid var(--color-status-deadline)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-status-deadline)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-status-deadline)'
              }}
            >
              <Trash2 size={14} />
              삭제
            </button>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="h-[44px] w-[100px] rounded-[10px] text-[14px] font-medium transition-all cursor-pointer"
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
              className="h-[44px] w-[100px] rounded-[10px] text-[14px] font-semibold text-white transition-all cursor-pointer"
              style={{
                background: 'var(--color-brand)',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-brand)' }}
            >
              {loading ? '수정 중...' : '수정'}
            </button>
          </div>
        </div>

      </div>
    </Modal>
  )
}

export default CardDetailModal