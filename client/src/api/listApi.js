import api from './axios'

// [리스트 생성]
export const createList = (data) => api.post('/lists', data)

// [리스트 수정]
export const updateList = (id, data) => api.patch(`/lists/${id}`, data)

// [리스트 삭제]
export const deleteList = (id) => api.delete(`/lists/${id}`)