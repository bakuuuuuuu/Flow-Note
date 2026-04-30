import { Bell } from 'lucide-react'
import NotiItem from './NotiItem'
import { useNavigate } from 'react-router-dom'

const FILTER_TABS = [
  { key: 'all',      label: '전체' },
  { key: 'DEADLINE', label: '마감 임박' },
  { key: 'UPDATE',   label: '업데이트' },
  { key: 'SYSTEM',   label: '시스템' },
]

const groupByDate = (list) => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek  = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())
  const groups = { today: [], week: [], older: [] }
  list.forEach(n => {
    const d = new Date(n.createdAt)
    if (d >= startOfToday)     groups.today.push(n)
    else if (d >= startOfWeek) groups.week.push(n)
    else                       groups.older.push(n)
  })
  return groups
}

const groupLabels = { today: '오늘', week: '이번 주', older: '이전' }

const AlarmTab = ({ notifications, unreadCount, loading, notiFilter, setNotiFilter, readOne, readAll, removeOne }) => {
  const navigate = useNavigate()

  const filteredNotis = notiFilter === 'all'
    ? notifications
    : notifications.filter(n => n.category === notiFilter)
  const groups = groupByDate(filteredNotis)

  const handleNotiNavigate = (noti) => {
    readOne(noti._id)
    const url = noti.link_url
    const isValid = url && (
      url.startsWith('/home') ||
      url.startsWith('/board/') ||
      url.startsWith('/mypage') ||
      url.startsWith('/priority') ||
      url.startsWith('/starred')
    )
    navigate(isValid ? url : '/home')
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-bold flex items-center gap-2" style={{ letterSpacing: '-0.4px' }}>
          알림
          {unreadCount > 0 && (
            <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--color-status-deadline)' }}>
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={readAll}
            className="text-[13px] px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        {FILTER_TABS.map(tab => {
          const tabUnread = tab.key === 'all'
            ? 0
            : notifications.filter(n => n.category === tab.key && !n.is_read).length
          return (
            <button
              key={tab.key}
              onClick={() => setNotiFilter(tab.key)}
              className="flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center justify-center gap-1"
              style={{
                background: notiFilter === tab.key ? 'var(--color-surface)' : 'transparent',
                color: notiFilter === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                boxShadow: notiFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
              {tabUnread > 0 && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded-full text-white" style={{ background: 'var(--color-status-deadline)' }}>
                  {tabUnread}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 알림 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--color-text-muted)' }}>
          불러오는 중...
        </div>
      ) : filteredNotis.length === 0 ? (
        <div className="rounded-xl flex flex-col items-center justify-center py-24" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <Bell size={36} className="mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
            {notiFilter === 'all' ? '알림이 없어요.' : '해당 카테고리의 알림이 없어요.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groups).map(([groupKey, items]) => {
            if (items.length === 0) return null
            return (
              <div key={groupKey}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {groupLabels[groupKey]}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  <span className="text-[11px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {items.length}건
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map(noti => (
                    <NotiItem
                      key={noti._id}
                      noti={noti}
                      onNavigate={handleNotiNavigate}
                      onReadOne={readOne}
                      onRemove={removeOne}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default AlarmTab