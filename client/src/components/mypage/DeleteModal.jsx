import { Trash2 } from 'lucide-react'

const DeleteModal = ({ profile, deleteConfirmPw, setDeleteConfirmPw, onDelete, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-xl w-full max-w-[400px] mx-4 p-8"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <Trash2 size={22} style={{ color: 'var(--color-status-deadline)' }} />
        </div>

        <h2 className="text-[20px] font-bold mb-2 text-center" style={{ color: 'var(--color-text-primary)' }}>
          정말 탈퇴할까요?
        </h2>
        <p className="text-[13px] mb-6 text-center leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          탈퇴하면 모든 보드와 카드가 삭제돼요.<br />
          이 작업은 <span style={{ color: 'var(--color-status-deadline)', fontWeight: 600 }}>되돌릴 수 없어요.</span>
          {profile?.provider === 'local' && <><br />확인을 위해 비밀번호를 입력해주세요.</>}
        </p>

        {profile?.provider === 'local' && (
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={deleteConfirmPw}
            onChange={(e) => setDeleteConfirmPw(e.target.value)}
            className="w-full h-11 px-4 rounded-lg text-[14px] outline-none mb-5"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-status-deadline)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-lg text-[13px] font-medium transition-all"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            취소
          </button>
          <button
            onClick={onDelete}
            disabled={profile?.provider === 'local' && !deleteConfirmPw}
            className="flex-1 h-11 rounded-lg text-[13px] font-semibold text-white transition-all"
            style={{
              background: 'var(--color-status-deadline)',
              opacity: (profile?.provider === 'local' && !deleteConfirmPw) ? 0.4 : 1,
              cursor: (profile?.provider === 'local' && !deleteConfirmPw) ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!(profile?.provider === 'local' && !deleteConfirmPw)) {
                e.currentTarget.style.background = '#dc2626'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-status-deadline)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal