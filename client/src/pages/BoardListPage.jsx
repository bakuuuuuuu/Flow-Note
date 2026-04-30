import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, AlertCircle, LayoutGrid, Plus, Calendar, Layers, Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useBoardStore from '../store/boardStore'
import { getCategoryEmoji } from '../constants/categories'
import NewBoardModal from "../components/board/NewBoardModal";

const PAGE_CONFIG = {
  all: {
    icon: LayoutGrid,
    iconColor: 'var(--color-brand)',
    title: '내 보드',
    description: (count) => `총 ${count}개의 보드`,
    emptyTitle: '나만의 워크스페이스를 시작해보세요',
    emptyDesc: '보드를 만들어 프로젝트나 일정을 관리할 수 있어요.',
    emptyEmoji: '🚀',
    filter: (boards) => boards,
  },
  priority: {
    icon: AlertCircle,
    iconColor: 'var(--color-status-deadline)',
    title: '우선순위',
    description: () => '마감일이 임박한 순서로 정렬돼요.',
    emptyTitle: '우선순위 보드가 없어요',
    emptyDesc: '마감일이 설정된 보드가 없어요.',
    emptyEmoji: '📋',
    filter: (boards) => [...boards].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline) - new Date(b.deadline)
    }),
  },
  starred: {
    icon: Star,
    iconColor: '#f59e0b',
    iconFill: true,
    title: '즐겨찾기',
    description: (count) => `즐겨찾기한 보드 ${count}개`,
    emptyTitle: '즐겨찾기한 보드가 없어요',
    emptyDesc: '보드의 별 아이콘을 눌러서 즐겨찾기해보세요!',
    emptyEmoji: '⭐',
    filter: (boards) => boards.filter((b) => b.is_starred),
  },
}

const getDdayText = (deadline) => {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0)  return { label: `D+${Math.abs(diff)}`, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' }
  if (diff === 0) return { label: 'D-Day', color: 'white', bg: 'var(--color-status-deadline)' }
  if (diff <= 3)  return { label: `D-${diff}`, color: 'white', bg: 'var(--color-status-deadline)' }
  if (diff <= 7)  return { label: `D-${diff}`, color: 'white', bg: 'var(--color-status-doing)' }
  return              { label: `D-${diff}`, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' }
}

const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/ /g, '').replace(/\.$/, '')
}

const getTodayText = () => {
  const now = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`
}

const getInitialCount = (mode) => mode === 'all' ? 8 : 9

const BoardListPage = ({ mode = 'all' }) => {
  const navigate = useNavigate()
  const { boards, fetchBoards, loading } = useBoardStore()
  const { justLoggedIn, setJustLoggedIn, user } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(getInitialCount(mode))
  const config = PAGE_CONFIG[mode]

  useEffect(() => {
    setVisibleCount(getInitialCount(mode))
  }, [mode])

  useEffect(() => {
    const load = async () => {
      await fetchBoards()
      if (mode === 'all' && justLoggedIn) {
        setJustLoggedIn(false)
        const lastBoardId = localStorage.getItem('lastBoardId')
        if (lastBoardId) {
          const exists = useBoardStore.getState().boards.find((b) => b._id === lastBoardId)
          if (exists) {
            navigate(`/board/${lastBoardId}`, { replace: true })
          } else {
            localStorage.removeItem('lastBoardId')
          }
        }
      }
    }
    load()
  }, [])

  const handleBoardClick = (board) => {
    localStorage.setItem('lastBoardId', board._id)
    navigate(`/board/${board._id}`)
  }

  const filteredBoards = config.filter(boards)
  const visibleBoards = filteredBoards.slice(0, visibleCount)
  const hasMore = filteredBoards.length > visibleCount
  const remainCount = filteredBoards.length - visibleCount
  const Icon = config.icon

  // 통계
  const starredCount = boards.filter((b) => b.is_starred).length
  const urgentCount = boards.filter((b) => {
    if (!b.deadline) return false
    const diff = Math.ceil((new Date(b.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 7
  }).length
  const overdueCount = boards.filter((b) => {
    if (!b.deadline) return false
    return new Date(b.deadline) < new Date()
  }).length
  const recentBoards = [...boards]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3)

  // 즐겨찾기 카테고리 분포
  const starredBoards = boards.filter((b) => b.is_starred)
  const categoryMap = starredBoards.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1
    return acc
  }, {})
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
      <p>불러오는 중...</p>
    </div>
  )

  return (
    <div className="p-8">

      {/* ══════════════════════════════════════════
          홈 전용 섹션
      ══════════════════════════════════════════ */}
      {mode === 'all' && (
        <>
          <div className="mb-8">
            <p className="text-[13px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {getTodayText()}
            </p>
            <h1 className="text-[26px] font-bold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
              안녕하세요, {user?.nickname ?? ''}님 👋
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: '전체 보드', value: boards.length, icon: LayoutGrid, color: 'var(--color-brand)', bg: 'rgba(45,64,142,0.08)' },
              { label: '즐겨찾기', value: starredCount, icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              { label: '마감 임박 (7일 이내)', value: urgentCount, icon: AlertCircle, color: 'var(--color-status-deadline)', bg: 'rgba(224,49,49,0.08)' },
            ].map(({ label, value, icon: StatIcon, color, bg }) => (
              <div key={label} className="rounded-[14px] p-5 flex items-center gap-4"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <StatIcon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="text-[24px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {recentBoards.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} style={{ color: 'var(--color-text-muted)' }} />
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>최근 보드</h2>
              </div>
              <div className="flex gap-3">
                {recentBoards.map((board) => (
                  <button key={board._id} onClick={() => handleBoardClick(board)}
                    className="flex items-center gap-3 px-4 h-[52px] rounded-[12px] transition-all flex-shrink-0"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', maxWidth: '220px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(45,64,142,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <span className="text-[20px] flex-shrink-0">{getCategoryEmoji(board.category)}</span>
                    <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{board.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-[1px] mb-8" style={{ background: 'var(--color-border)' }} />
        </>
      )}

      {/* ══════════════════════════════════════════
          우선순위 전용 섹션
      ══════════════════════════════════════════ */}
      {mode === 'priority' && boards.length > 0 && (
        <div className="mb-8">
          {/* 타이틀 */}
          <div className="mb-6">
            <h1 className="text-[26px] font-bold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
              우선순위
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              마감일이 임박한 순서로 정렬돼요.
            </p>
          </div>

          {/* 마감 현황 요약 3개 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              {
                label: '기한 초과',
                value: overdueCount,
                icon: XCircle,
                color: 'var(--color-status-deadline)',
                bg: 'rgba(224,49,49,0.08)',
                desc: '마감일이 지났어요',
              },
              {
                label: '7일 이내 마감',
                value: urgentCount,
                icon: AlertCircle,
                color: 'var(--color-status-doing)',
                bg: 'rgba(245,158,11,0.08)',
                desc: '곧 마감돼요',
              },
              {
                label: '마감일 미설정',
                value: boards.filter((b) => !b.deadline).length,
                icon: CheckCircle2,
                color: 'var(--color-status-done)',
                bg: 'rgba(16,185,129,0.08)',
                desc: '여유 있어요',
              },
            ].map(({ label, value, icon: StatIcon, color, bg, desc }) => (
              <div key={label} className="rounded-[14px] p-5 flex items-center gap-4"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <StatIcon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="text-[24px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                  <p className="text-[12px] font-medium" style={{ color }}>{label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-[1px] mb-8" style={{ background: 'var(--color-border)' }} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          즐겨찾기 전용 섹션
      ══════════════════════════════════════════ */}
      {mode === 'starred' && boards.length > 0 && (
        <div className="mb-8">
          {/* 타이틀 */}
          <div className="mb-6">
            <h1 className="text-[26px] font-bold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
              즐겨찾기
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              자주 사용하는 보드를 모아봤어요.
            </p>
          </div>

          {/* 즐겨찾기 요약 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-[14px] p-5 flex items-center gap-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <Star size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-[24px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{starredCount}</p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>즐겨찾기 보드</p>
              </div>
            </div>
            <div className="rounded-[14px] p-5 flex items-center gap-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(45,64,142,0.08)' }}>
                <TrendingUp size={20} style={{ color: 'var(--color-brand)' }} />
              </div>
              <div>
                <p className="text-[24px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                  {starredBoards.reduce((acc, b) => acc + (b.cardCount ?? 0), 0)}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>총 카드 수</p>
              </div>
            </div>
            {/* 상위 카테고리 */}
            <div className="rounded-[14px] p-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>주요 카테고리</p>
              {topCategories.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px]">{getCategoryEmoji(cat)}</span>
                        <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{cat}</span>
                      </div>
                      <span className="text-[12px] font-semibold" style={{ color: 'var(--color-brand)' }}>{count}개</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>없음</p>
              )}
            </div>
          </div>

          <div className="h-[1px] mb-8" style={{ background: 'var(--color-border)' }} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          공통: 상단 타이틀 (all 제외, 보드 없을 때도 표시)
      ══════════════════════════════════════════ */}
      {mode !== 'all' && (filteredBoards.length === 0 || boards.length === 0) && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${config.iconColor}18` }}
          >
            <Icon size={20} fill={config.iconFill ? 'currentColor' : 'none'} style={{ color: config.iconColor }} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
              {config.title}
            </h2>
            <p className="text-[12px] mt-[1px]" style={{ color: 'var(--color-text-muted)' }}>
              {config.description(filteredBoards.length)}
            </p>
          </div>
        </div>
      )}

      {/* all 모드 타이틀 */}
      {mode === 'all' && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${config.iconColor}18` }}
          >
            <Icon size={20} style={{ color: config.iconColor }} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
              {config.title}
            </h2>
            <p className="text-[12px] mt-[1px]" style={{ color: 'var(--color-text-muted)' }}>
              {config.description(filteredBoards.length)}
            </p>
          </div>
        </div>
      )}

      {/* ── 보드 없을 때 ── */}
      {filteredBoards.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 'calc(100vh - 480px)' }}>
          <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center"
            style={{ background: 'var(--color-surface-2)', fontSize: '32px' }}
          >
            {config.emptyEmoji}
          </div>
          <div className="text-center">
            <p className="text-[18px] font-bold mb-2" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.4px' }}>
              {config.emptyTitle}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>{config.emptyDesc}</p>
          </div>
          {mode === 'all' && (
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 h-[44px] px-6 rounded-[10px] text-white text-[14px] font-semibold transition-all mt-2"
              style={{ background: 'var(--color-brand)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-brand-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-brand)'}
            >
              <Plus size={16} />
              새 보드 만들기
            </button>
          )}
        </div>
      )}

      {/* ── 보드 그리드 ── */}
      {filteredBoards.length > 0 && (
        <>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {mode === 'all' && (
              <button onClick={() => setModalOpen(true)}
                className="rounded-[14px] p-5 cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 border border-dashed"
                style={{ minHeight: '160px', borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.color = 'var(--color-brand)'; e.currentTarget.style.background = 'rgba(45,64,142,0.04)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
              >
                <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }}>
                  <Plus size={18} />
                </div>
                <span className="text-[13px] font-medium">새 보드 만들기</span>
              </button>
            )}

            {visibleBoards.map((board) => {
              const dday = getDdayText(board.deadline)
              const isHovered = hoveredId === board._id
              return (
                <div key={board._id}
                  onClick={() => handleBoardClick(board)}
                  onMouseEnter={() => setHoveredId(board._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative rounded-[14px] p-5 cursor-pointer transition-all duration-150"
                  style={{
                    background: 'var(--color-surface)',
                    border: `1px solid ${isHovered ? 'var(--color-brand)' : 'var(--color-border)'}`,
                    boxShadow: isHovered ? '0 4px 20px rgba(45,64,142,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  {board.is_starred && (
                    <Star size={14} className="absolute top-4 right-4" fill="currentColor" style={{ color: '#f59e0b' }} />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center text-[24px]"
                      style={{ background: 'var(--color-surface-2)' }}
                    >
                      {getCategoryEmoji(board.category)}
                    </div>
                    {dday && (
                      <span className="h-[22px] px-2 rounded-full text-[11px] font-bold flex items-center"
                        style={{ background: dday.bg, color: dday.color }}
                      >
                        {dday.label}
                      </span>
                    )}
                  </div>
                  <h2 className="text-[15px] font-semibold mb-1 truncate pr-4" style={{ color: 'var(--color-text-primary)' }}>
                    {board.title}
                  </h2>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--color-text-muted)' }}>{board.category}</p>
                  <div className="h-[1px] mb-3" style={{ background: 'var(--color-border)' }} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} style={{ color: 'var(--color-text-muted)' }} />
                      {board.deadline ? (
                        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                          {board.start_date ? `${formatDate(board.start_date)} ~ ` : '~ '}
                          {formatDate(board.deadline)}
                        </span>
                      ) : (
                        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>기간 미설정</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers size={11} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        {board.cardCount ?? 0}개 카드
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="h-[40px] px-6 rounded-[10px] text-[13px] font-medium transition-all"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.color = 'var(--color-brand)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
              >
                더 보기 ({remainCount}개 남음)
              </button>
            </div>
          )}
        </>
      )}

      <NewBoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newBoard) => {
          fetchBoards()
          localStorage.setItem('lastBoardId', newBoard._id)
          navigate(`/board/${newBoard._id}`)
        }}
      />
    </div>
  )
}

export default BoardListPage