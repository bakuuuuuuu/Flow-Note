import { create } from 'zustand'
import { createCard, updateCard, deleteCard, moveCard, getCardById } from '../api/cardApi'

const useCardStore = create((set) => ({
  currentCard: null,
  loading: false,
  error: null,

  // [카드 상세 조회]
  fetchCardById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await getCardById(id)
      set({ currentCard: data })
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || '카드 조회 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [카드 생성]
  addCard: async (data, listStore) => {
    set({ loading: true, error: null })
    try {
      const { data: newCard } = await createCard(data)
      listStore.setState((state) => ({
        lists: state.lists.map((l) =>
          l._id === newCard.list_id
            ? { ...l, cards: [...(l.cards || []), newCard] }
            : l
        ),
      }))
      return newCard
    } catch (err) {
      set({ error: err.response?.data?.message || '카드 생성 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [카드 수정]
  editCard: async (id, data, listStore) => {
    set({ loading: true, error: null })
    try {
      const { data: updatedCard } = await updateCard(id, data)
      listStore.setState((state) => ({
        lists: state.lists.map((l) => ({
          ...l,
          cards: (l.cards || []).map((c) => c._id === id ? updatedCard : c),
        })),
      }))
      return updatedCard
    } catch (err) {
      set({ error: err.response?.data?.message || '카드 수정 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [카드 삭제]
  removeCard: async (id, listId, listStore) => {
    set({ loading: true, error: null })
    try {
      await deleteCard(id)
      listStore.setState((state) => ({
        lists: state.lists.map((l) =>
          l._id === listId
            ? { ...l, cards: (l.cards || []).filter((c) => c._id !== id) }
            : l
        ),
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || '카드 삭제 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [카드 이동]
  transferCard: async (cardId, data) => {
    set({ loading: true, error: null })
    try {
      const { data: movedCard } = await moveCard(cardId, data)
      return movedCard
    } catch (err) {
      set({ error: err.response?.data?.message || '카드 이동 실패' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // [현재 카드 초기화]
  setCurrentCard: (card) => set({ currentCard: card }),
  clearCurrentCard: () => set({ currentCard: null }),
}))

export default useCardStore