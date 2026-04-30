import { useRef, useState, useEffect, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import useListStore from '../../store/listStore'
import useSidebarStore from '../../store/sidebarStore'
import { X } from 'lucide-react'

const STATUS_CONFIG = {
  '대기':   { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: '할 일' },
  '진행중': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: '진행 중' },
  '완료':   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: '완료' },
  '보류':   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: '보류' },
}

// 우선순위 정렬 기준 — 긴급 > 높음 > 보통 > 낮음
const PRIORITY_ORDER = { '긴급': 0, '높음': 1, '보통': 2, '낮음': 3 }

const PRIORITY_CONFIG = {
  '긴급': { color: '#e03131', bg: 'rgba(224,49,49,0.1)' },
  '높음': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  '보통': { color: '#8a95a3', bg: 'rgba(138,149,163,0.1)' },
  '낮음': { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

// timezone 오차 없이 로컬 날짜 문자열 반환 (YYYY-MM-DD)
const toLocalDateStr = (dateInput) => {
  const d = new Date(dateInput)
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// 카드 정렬 함수 — 우선순위 → 제목 가나다
const sortCards = (cards) =>
  [...cards].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 4
    const pb = PRIORITY_ORDER[b.priority] ?? 4
    if (pa !== pb) return pa - pb
    return (a.title ?? '').localeCompare(b.title ?? '', 'ko')
  })

const CalendarView = ({ onCardClick }) => {
  const { lists } = useListStore()
  const { isOpen } = useSidebarStore()
  const calendarRef = useRef(null)
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [titleText, setTitleText] = useState('')
  const [moreModal, setMoreModal] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const api = calendarRef.current?.getApi()
      if (api) {
        const d = api.getDate()
        setTitleText(`${d.getFullYear()}년 ${d.getMonth() + 1}월`)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      calendarRef.current?.getApi()?.updateSize()
    }, 210)
    return () => clearTimeout(timer)
  }, [isOpen])

  const updateTitle = () => {
    const api = calendarRef.current?.getApi()
    if (api) {
      const d = api.getDate()
      setTitleText(`${d.getFullYear()}년 ${d.getMonth() + 1}월`)
    }
  }

  const allCards = lists.flatMap((l) => l.cards ?? [])

  // 우선순위 정렬 후 이벤트 변환
  const events = sortCards(
    allCards.filter((card) => card.due_date || card.start_date)
  ).map((card) => {
    const cfg = STATUS_CONFIG[card.status] ?? STATUS_CONFIG['대기']
    const displayDate = card.due_date
      ? toLocalDateStr(card.due_date)
      : toLocalDateStr(card.start_date)

    const hasPeriod = card.start_date && card.due_date
    const startStr = card.start_date
      ? (() => { const d = new Date(card.start_date); return `${d.getMonth()+1}/${d.getDate()}` })()
      : null
    const endStr = card.due_date
      ? (() => { const d = new Date(card.due_date); return `${d.getMonth()+1}/${d.getDate()}` })()
      : null

    return {
      id: card._id,
      title: card.title,
      start: displayDate,
      allDay: true,
      backgroundColor: cfg.bg,
      borderColor: cfg.color,
      textColor: cfg.color,
      extendedProps: { card, cfg, hasPeriod, periodText: hasPeriod ? `${startStr}~${endStr}` : null },
    }
  })

  const now = new Date()
  const thisMonthCards = allCards.filter((c) => {
    if (!c.due_date) return false
    const d = new Date(c.due_date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const stats = [
    { label: '전체',      value: thisMonthCards.length,                                     color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' },
    { label: '완료',      value: thisMonthCards.filter((c) => c.status === '완료').length,   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: '진행 중',   value: thisMonthCards.filter((c) => c.status === '진행중').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: '마감 임박', value: thisMonthCards.filter((c) => {
      const diff = Math.ceil((new Date(c.due_date) - now) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 3
    }).length, color: '#e03131', bg: 'rgba(224,49,49,0.1)' },
  ]

  const handleViewChange = (view) => {
    setCurrentView(view)
    calendarRef.current?.getApi().changeView(view)
    setTimeout(updateTitle, 0)
  }

  const handlePrev  = () => { calendarRef.current?.getApi().prev();  setTimeout(updateTitle, 0) }
  const handleNext  = () => { calendarRef.current?.getApi().next();  setTimeout(updateTitle, 0) }
  const handleToday = () => { calendarRef.current?.getApi().today(); setTimeout(updateTitle, 0) }

  const handleMoreClick = useCallback((info) => {
    const date = info.date
    const label = `${date.getMonth() + 1}월 ${date.getDate()}일`
    const dateStr = toLocalDateStr(date)

    const dateCards = sortCards(
      allCards.filter((card) => {
        const d = card.due_date
          ? toLocalDateStr(card.due_date)
          : card.start_date
          ? toLocalDateStr(card.start_date)
          : null
        return d === dateStr
      })
    )

    setMoreModal({ label, cards: dateCards })
    return 'stop'
  }, [allCards])

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── 헤더 ── */}
      <div className="flex-shrink-0 px-10 h-[52px] flex items-center relative">
        <div className="flex items-center gap-2 z-10">
          <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--color-text-muted)' }}>이번 달</span>
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-1 h-[22px] px-2 rounded-full flex-shrink-0" style={{ background: bg }}>
              <span className="text-[12px] font-bold" style={{ color }}>{value}</span>
              <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="absolute left-0 right-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1 pointer-events-auto">
            <button onClick={handlePrev}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[7px] text-[14px] transition-colors"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
            >‹</button>
            <span className="text-[14px] font-bold px-3 min-w-[110px] text-center select-none"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}
            >{titleText}</span>
            <button onClick={handleNext}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[7px] text-[14px] transition-colors"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
            >›</button>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto z-10">
          {[
            { key: 'dayGridMonth', label: '월' },
            { key: 'dayGridWeek',  label: '주' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => handleViewChange(key)}
              className="h-[28px] px-3 rounded-[7px] text-[12px] font-semibold transition-all"
              style={{
                background: currentView === key ? 'var(--color-brand)' : 'var(--color-surface-2)',
                color:      currentView === key ? 'white' : 'var(--color-text-muted)',
                border:     `1px solid ${currentView === key ? 'var(--color-brand)' : 'var(--color-border)'}`,
              }}
            >{label}</button>
          ))}
          <button onClick={handleToday}
            className="h-[28px] px-3 rounded-[7px] text-[12px] font-semibold transition-colors ml-1"
            style={{ background: 'transparent', color: 'var(--color-brand)', border: '1px solid var(--color-brand)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(45,64,142,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >오늘</button>
        </div>
      </div>

      {/* ── 캘린더 ── */}
      <div className="flex-1 min-h-0 px-10 pb-6 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          headerToolbar={false}
          events={events}
          dayMaxEvents={currentView === 'dayGridMonth' ? 3 : 8}
          fixedWeekCount={false}
          dayCellContent={(arg) => ({
            html: `<span>${arg.dayNumberText.replace('일', '')}</span>`
          })}
          datesSet={updateTitle}
          moreLinkClick={handleMoreClick}
          moreLinkContent={(args) => `+${args.num}개 더보기`}
          eventClick={({ event }) => {
            const card = event.extendedProps.card
            if (card && onCardClick) onCardClick(card)
          }}
          eventContent={(arg) => {
            const { cfg, hasPeriod, periodText } = arg.event.extendedProps
            const isWeek = currentView === 'dayGridWeek'
            return (
              <div
                className="flex items-center gap-[4px] w-full overflow-hidden px-[5px]"
                style={{ height: isWeek ? '36px' : '18px' }}
                title={hasPeriod ? `${periodText} ${arg.event.title}` : arg.event.title}
              >
                <span className="rounded-full flex-shrink-0"
                  style={{ background: cfg.color, width: isWeek ? '6px' : '4px', height: isWeek ? '6px' : '4px' }}
                />
                {hasPeriod && (
                  <span className="text-[9px] flex-shrink-0 opacity-70" style={{ color: cfg.color }}>
                    {periodText}
                  </span>
                )}
                <span className="truncate" style={{ color: cfg.color, fontWeight: 500, fontSize: isWeek ? '12px' : '11px' }}>
                  {arg.event.title}
                </span>
              </div>
            )
          }}
        />
      </div>

      {/* ── 더보기 커스텀 모달 ── */}
      {moreModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMoreModal(null)}
        >
          <div
            className="rounded-[16px] p-6 w-[380px] flex flex-col"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              maxHeight: '480px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {moreModal.label} 카드 목록
                </h3>
                <p className="text-[11px] mt-[2px]" style={{ color: 'var(--color-text-muted)' }}>
                  총 {moreModal.cards.length}개 · 우선순위 순
                </p>
              </div>
              <button onClick={() => setMoreModal(null)}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-[7px] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              ><X size={15} /></button>
            </div>

            {/* 카드 목록 — 최대 높이 + 스크롤 */}
            <div className="flex flex-col gap-2 overflow-y-auto min-h-0">
              {moreModal.cards.map((card) => {
                const cfg = STATUS_CONFIG[card.status] ?? STATUS_CONFIG['대기']
                const hasPeriod = card.start_date && card.due_date
                const startStr = card.start_date
                  ? (() => { const d = new Date(card.start_date); return `${d.getMonth()+1}/${d.getDate()}` })()
                  : null
                const endStr = card.due_date
                  ? (() => { const d = new Date(card.due_date); return `${d.getMonth()+1}/${d.getDate()}` })()
                  : null

                return (
                  <button key={card._id}
                    onClick={() => { setMoreModal(null); onCardClick?.(card) }}
                    className="flex items-center gap-3 px-4 rounded-[10px] text-left transition-all w-full flex-shrink-0"
                    style={{
                      minHeight: '52px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      background: cfg.bg,
                      border: `1px solid ${cfg.color}30`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = cfg.color}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = `${cfg.color}30`}
                  >
                    <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {card.title}
                      </span>
                      {hasPeriod && (
                        <span className="text-[11px] mt-[1px]" style={{ color: 'var(--color-text-muted)' }}>
                          {startStr} ~ {endStr}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      
                      {card.priority && (
                        <span
                          className="text-[10px] font-bold px-[6px] py-[2px] rounded-full"
                          style={{
                            color: PRIORITY_CONFIG[card.priority]?.color ?? '#8a95a3',
                            background: PRIORITY_CONFIG[card.priority]?.bg ?? 'rgba(138,149,163,0.1)',
                          }}
                        >
                          {card.priority}
                        </span>
                      )}

                      {/* 상태 배지 */}
                      <span className="text-[10px] font-medium" style={{ color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView