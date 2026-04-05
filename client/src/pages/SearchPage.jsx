import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Star, Calendar, Layers } from 'lucide-react'
import { search, saveSearchKeyword, getRecentSearches, deleteSearchHistory } from '../api/searchApi'
import { getCategoryEmoji } from '../constants/categories'
import toast from 'react-hot-toast'

const STATUS_MAP = {
  '대기':   { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  '진행중': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  '완료':   { color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  '보류':   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
}

const getDdayText = (deadline) => {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0)   return { label: `D+${Math.abs(diff)}`, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' }
  if (diff === 0) return { label: 'D-Day', color: 'white', bg: 'var(--color-status-deadline)' }
  if (diff <= 3)  return { label: `D-${diff}`, color: 'white', bg: 'var(--color-status-deadline)' }
  if (diff <= 7)  return { label: `D-${diff}`, color: 'white', bg: 'var(--color-status-doing)' }
  return { label: `D-${diff}`, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' }
}

const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/ /g, '').replace(/\.$/, '')
}

const Highlight = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} style={{ background: 'rgba(45,64,142,0.2)', color: 'var(--color-brand)', borderRadius: '3px', padding: '0 2px', fontWeight: 600, fontStyle: 'normal' }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}

// ── 홈과 동일한 보드 카드 ──
const BoardCard = ({ board, query, onClick }) => {
  const [hovered, setHovered] = useState(false)
  const dday = getDdayText(board.deadline)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: '14px', padding: '20px', cursor: 'pointer',
        background: 'var(--color-surface)',
        border: `1px solid ${hovered ? 'var(--color-brand)' : 'var(--color-border)'}`,
        boxShadow: hovered ? '0 4px 20px rgba(45,64,142,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.15s',
      }}
    >
      {board.is_starred && (
        <Star size={14} style={{ position: 'absolute', top: '16px', right: '16px', color: '#f59e0b' }} fill="#f59e0b" />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'var(--color-surface-2)' }}>
          {getCategoryEmoji(board.category)}
        </div>
        {dday && (
          <span style={{ height: '22px', padding: '0 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', background: dday.bg, color: dday.color }}>
            {dday.label}
          </span>
        )}
      </div>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px', paddingRight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Highlight text={board.title} query={query} />
      </h2>
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 16px' }}>{board.category}</p>
      <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={11} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {board.deadline
              ? `${board.start_date ? `${formatDate(board.start_date)} ~ ` : '~ '}${formatDate(board.deadline)}`
              : '기간 미설정'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={11} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{board.cardCount ?? 0}개 카드</span>
        </div>
      </div>
    </div>
  )
}

// ── 카드도 보드 카드와 동일한 스타일 ──
const CardCard = ({ card, query, onClick }) => {
  const [hovered, setHovered] = useState(false)
  const dday = getDdayText(card.due_date)
  const status = STATUS_MAP[card.status] ?? { color: 'var(--color-text-muted)', bg: 'var(--color-surface)' }
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: '14px', padding: '20px', cursor: 'pointer',
        background: 'var(--color-surface)',
        border: `1px solid ${hovered ? 'var(--color-brand)' : 'var(--color-border)'}`,
        boxShadow: hovered ? '0 4px 20px rgba(45,64,142,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.15s',
      }}
    >
      {/* 상단: 상태 도트 아이콘 박스 + 상태 뱃지 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: status.bg }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: status.color }} />
        </div>
        <span style={{ height: '22px', padding: '0 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', background: status.bg, color: status.color }}>
          {card.status}
        </span>
      </div>

      {/* 보드명 */}
      {card.board && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px' }}>{getCategoryEmoji(card.board.category)}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{card.board.title}</span>
        </div>
      )}

      {/* 카드 제목 */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Highlight text={card.title} query={query} />
      </h2>

      {/* 내용 */}
      {card.content ? (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Highlight text={card.content} query={query} />
        </p>
      ) : (
        <div style={{ marginBottom: '16px' }} />
      )}

      <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '12px' }} />

      {/* 하단: 라벨 + D-day */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {card.labels?.slice(0, 2).map((label, i) => (
            <span key={i} style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: `${label.color}20`, color: label.color }}>
              {label.text}
            </span>
          ))}
          {card.labels?.length > 2 && (
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              +{card.labels.length - 2}
            </span>
          )}
          {(!card.labels || card.labels.length === 0) && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>라벨 없음</span>
          )}
        </div>
        {dday && (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: dday.bg, color: dday.color }}>
            {dday.label}
          </span>
        )}
      </div>
    </div>
  )
}

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') ?? ''

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const { data } = await getRecentSearches()
        setRecentSearches(data)
      } catch {}
    }
    loadRecent()
  }, [])

  useEffect(() => {
    setActiveTab('all')
    if (!query) { setResults(null); return }
    const doSearch = async () => {
      setLoading(true)
      try {
        const { data } = await search(query)
        setResults(data)
        await saveSearchKeyword(query)
        const { data: recent } = await getRecentSearches()
        setRecentSearches(recent)
      } catch {
        toast.error('검색 중 오류가 발생했어요.')
      } finally {
        setLoading(false)
      }
    }
    doSearch()
  }, [query])

  const handleDeleteRecent = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteSearchHistory(id)
      setRecentSearches(prev => prev.filter(h => h._id !== id))
    } catch {}
  }

  const displayBoards = results?.boards ?? []
  const displayCards  = results?.cards  ?? []
  const filteredBoards = activeTab === 'cards'  ? [] : displayBoards
  const filteredCards  = activeTab === 'boards' ? [] : displayCards
  const totalCount = displayBoards.length + displayCards.length

  const SectionLabel = ({ text, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>{text}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{count}건</span>
    </div>
  )

  // ── 검색 전 ──
  if (!query) return (
    <div style={{ padding: '40px 40px 80px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '6px', color: 'var(--color-text-primary)' }}>검색</h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>보드와 카드를 통합 검색해보세요.</p>
      {recentSearches.length > 0 ? (
        <>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '12px' }}>최근 검색어</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {recentSearches.map(h => (
              <div key={h._id} onClick={() => navigate(`/search?q=${encodeURIComponent(h.keyword)}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontSize: '13px', color: 'var(--color-text-primary)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.color = 'var(--color-brand)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                {h.keyword}
                <span onClick={e => handleDeleteRecent(h._id, e)} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-status-deadline)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ borderRadius: '16px', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: '12px' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>헤더 검색바에서 검색어를 입력해보세요</p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 80px' }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--color-text-primary)', margin: 0 }}>
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>"</span>
          {query}
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>"</span>
        </h1>
        {!loading && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{totalCount}건의 결과</span>}
      </div>

      {/* 탭 */}
      {!loading && results && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
          {[
            { key: 'all', label: '전체', count: totalCount },
            { key: 'boards', label: '보드', count: displayBoards.length },
            { key: 'cards', label: '카드', count: displayCards.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: activeTab === tab.key ? 'var(--color-brand)' : 'var(--color-text-muted)', transition: 'color 0.15s' }}
            >
              {tab.label}
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '999px', background: activeTab === tab.key ? 'rgba(45,64,142,0.12)' : 'var(--color-surface-2)', color: activeTab === tab.key ? 'var(--color-brand)' : 'var(--color-text-muted)' }}>
                {tab.count}
              </span>
              {activeTab === tab.key && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--color-brand)', borderRadius: '2px 2px 0 0' }} />}
            </button>
          ))}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', gap: '12px', color: 'var(--color-text-muted)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p style={{ fontSize: '14px' }}>검색 중...</p>
        </div>
      )}

      {/* 결과 없음 */}
      {!loading && results && totalCount === 0 && (
        <div style={{ borderRadius: '16px', padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>검색 결과가 없어요</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>다른 키워드로 검색해보세요.</p>
        </div>
      )}

      {/* 결과 */}
      {!loading && results && totalCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* 보드 */}
          {filteredBoards.length > 0 && (
            <section>
              <SectionLabel text="보드" count={filteredBoards.length} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredBoards.map(board => (
                  <BoardCard key={board._id} board={board} query={query} onClick={() => navigate(`/board/${board._id}`)} />
                ))}
              </div>
            </section>
          )}

          {/* 카드 */}
          {filteredCards.length > 0 && (
            <section>
              <SectionLabel text="카드" count={filteredCards.length} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredCards.map(card => (
                  <CardCard key={card._id} card={card} query={query} onClick={() => navigate(`/board/${card.board_id}`)} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}

export default SearchPage