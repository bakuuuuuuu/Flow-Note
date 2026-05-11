import { useState } from 'react'
import { Link2, Check, Globe, Lock } from 'lucide-react'
import Modal from '../common/Modal'
import useAuthStore from '../../store/authStore'

const ShareModal = ({ isOpen, onClose, board }) => {
  const { user } = useAuthStore()
  const [isPublic, setIsPublic] = useState(board?.isPublic ?? false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/board/${board?._id}`

  const handleCopy = () => {
    if (!isPublic) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = () => {
    setIsPublic(prev => !prev)
  }

  const displayName = user?.nickname || user?.name || '사용자'
  const displayInitial = displayName[0].toUpperCase()

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            보드 공유
          </h2>
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

        {/* Owner */}
        <div className="flex items-center gap-3 mb-5">
          {/* 아바타 w-9 = 36px */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center
                      text-white text-sm font-bold shrink-0 overflow-hidden"
            style={{ background: 'var(--color-brand)' }}
          >
            {user?.profile_img && user.profile_img !== 'default_profile.png'
              ? <img src={`${import.meta.env.VITE_API_URL}${user.profile_img}`} alt="프로필" className="w-full h-full object-cover" />
              : displayInitial
            }
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {displayName}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Owner</p>
          </div>
        </div>

        <div className="h-px mb-5" style={{ background: 'var(--color-border)' }} />

        {/* 웹 공개 토글 — 아바타(36px) + gap(12px) = 48px 들여쓰기로 윗줄 텍스트와 정렬 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 아이콘을 36px 너비 박스 안에 중앙 정렬 → 윗줄 아바타와 x축 일치 */}
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              {isPublic
                ? <Globe size={17} style={{ color: 'var(--color-brand)' }} />
                : <Lock size={17} style={{ color: 'var(--color-text-muted)' }} />
              }
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                웹에 공개
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {isPublic ? '링크가 있는 누구나 볼 수 있어요' : '나만 볼 수 있어요'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
            style={{ background: isPublic ? 'var(--color-brand)' : 'var(--color-border)' }}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                          transition-transform duration-200
                          ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* 링크 복사 */}
        <div
          className={`flex gap-2 transition-opacity duration-200
                      ${isPublic ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
        >
          <div
            className="flex-1 flex items-center gap-2 px-3 h-10 rounded-lg text-xs overflow-hidden"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Link2 size={13} className="shrink-0" />
            <span className="truncate">{shareUrl}</span>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 h-10 px-4 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: copied ? '#10b981' : 'var(--color-brand)' }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.background = 'var(--color-brand-hover)' }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.background = 'var(--color-brand)' }}
          >
            {copied
              ? <span className="flex items-center gap-1.5"><Check size={13} />복사됨</span>
              : '링크 복사'
            }
          </button>
        </div>

      </div>
    </Modal>
  )
}

export default ShareModal