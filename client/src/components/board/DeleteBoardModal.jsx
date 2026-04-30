import Modal from '../common/Modal'

const DeleteBoardModal = ({ isOpen, onClose, boardTitle, onDelete, deleteLoading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px]">
      <div className="p-8">
        <h2 className="text-[22px] font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          보드를 삭제할까요?
        </h2>
        <p className="text-[14px] mb-8" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {boardTitle}
          </span> 보드와 포함된 모든 카드가 삭제돼요. 이 작업은 되돌릴 수 없어요.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-[44px] w-[100px] rounded-[10px] text-[14px] font-medium transition-all cursor-pointer"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            취소
          </button>
          <button
            onClick={onDelete}
            disabled={deleteLoading}
            className="h-[44px] w-[100px] rounded-[10px] text-[14px] font-semibold transition-all cursor-pointer"
            style={{ background: 'var(--color-status-deadline)', color: 'white', border: '1px solid var(--color-status-deadline)', opacity: deleteLoading ? 0.6 : 1 }}
            onMouseEnter={(e) => { if (!deleteLoading) e.currentTarget.style.background = '#c92a2a' }}
            onMouseLeave={(e) => { if (!deleteLoading) e.currentTarget.style.background = 'var(--color-status-deadline)' }}
          >
            {deleteLoading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteBoardModal