import { create } from 'zustand'
import { createList, updateList, deleteList } from '../api/listApi'

const useListStore = create((set) => ({
  lists: [],
  loading: false,
  error: null,

  // [리스트 추가]
  addList: async (data) => {
    set({ loading: true, error: null })
    try {
      const { data: newList } = await createList(data)
      set((state) => ({
        lists: [...state.lists, { ...newList, cards: [] }]
          .sort((a, b) => a.pos - b.pos),  // pos 기준 정렬
      }))
      return newList
    } catch (err) {
      set({ error: err.response?.data?.message || '리스트 생성 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [리스트 수정]
  editList: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const { data: updatedList } = await updateList(id, data)
      set((state) => ({
        lists: state.lists.map((l) => l._id === id ? { ...l, ...updatedList } : l),
      }))
      return updatedList
    } catch (err) {
      set({ error: err.response?.data?.message || '리스트 수정 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [리스트 삭제]
  removeList: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteList(id)
      set((state) => ({ lists: state.lists.filter((l) => l._id !== id) }))
    } catch (err) {
      set({ error: err.response?.data?.message || '리스트 삭제 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [보드 상세 조회 시 리스트 세팅]
  setLists: (lists) => set({ lists }),
}))

export default useListStore