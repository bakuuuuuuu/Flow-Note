import api from './axios'

// [알림 목록 조회]
export const getNotifications = () => api.get('/notifications')

// [개별 알림 읽음 처리]
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`)

// [전체 알림 읽음 처리]
export const markAllAsRead = () => api.patch('/notifications/read-all')

// [알림 삭제]
export const deleteNotification = (id) => api.delete(`/notifications/${id}`)