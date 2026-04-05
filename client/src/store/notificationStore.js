import { create } from 'zustand'
import {
  getNotifications,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
} from '../api/notificationApi'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  // [알림 목록 조회]
  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const { data } = await getNotifications()
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.is_read).length,
      })
    } catch {
      // 조용히 실패
    } finally {
      set({ loading: false })
    }
  },

  // [개별 읽음 처리]
  readOne: async (id) => {
    try {
      await markAsReadApi(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {}
  },

  // [전체 읽음 처리]
  readAll: async () => {
    try {
      await markAllAsReadApi()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }))
    } catch {}
  },

  // [알림 삭제]
  removeOne: async (id) => {
    try {
      await deleteNotificationApi(id)
      set((state) => {
        const removed = state.notifications.find((n) => n._id === id)
        return {
          notifications: state.notifications.filter((n) => n._id !== id),
          unreadCount: removed && !removed.is_read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        }
      })
    } catch {}
  },
}))

export default useNotificationStore