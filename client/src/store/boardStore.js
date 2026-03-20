import { create } from 'zustand'
import { getBoards, getBoardById, createBoard, updateBoard, deleteBoard } from '../api/boardApi'

const useBoardStore = create((set, get) => ({
  // ── 상태 ──
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  // [보드 목록 조회]
  fetchBoards: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await getBoards()
      set({ boards: data })
    } catch (err) {
      set({ error: err.response?.data?.message || '보드 목록 조회 실패' })
    } finally {
      set({ loading: false })
    }
  },

  // [특정 보드 상세 조회]
  fetchBoardById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await getBoardById(id)
      set({ currentBoard: data })
    } catch (err) {
      set({ error: err.response?.data?.message || '보드 조회 실패' })
    } finally {
      set({ loading: false })
    }
  },

  // [보드 생성]
  addBoard: async (boardData) => {
    try {
      const { data } = await createBoard(boardData)
      set((state) => ({ boards: [data, ...state.boards] }))
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || '보드 생성 실패' })
      throw err
    }
  },

  // [보드 수정]
  editBoard: async (id, boardData) => {
    try {
      const { data } = await updateBoard(id, boardData)
      set((state) => ({
        boards: state.boards.map((b) => (b._id === id ? data : b)),
        currentBoard: state.currentBoard?._id === id ? data : state.currentBoard,
      }))
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || '보드 수정 실패' })
      throw err
    }
  },

  // [보드 삭제]
  removeBoard: async (id) => {
    try {
      await deleteBoard(id)
      set((state) => ({
        boards: state.boards.filter((b) => b._id !== id),
        currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || '보드 삭제 실패' })
      throw err
    }
  },

  // [현재 보드 초기화]
  clearCurrentBoard: () => set({ currentBoard: null }),
}))

export default useBoardStore