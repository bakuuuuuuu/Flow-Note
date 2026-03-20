import api from './axios'

// [카드 생성]
export const createCard = (data) => api.post('/cards', data)

// [카드 수정]
export const updateCard = (id, data) => api.patch(`/cards/${id}`, data)

// [카드 삭제]
export const deleteCard = (id) => api.delete(`/cards/${id}`)

// [카드 이동]
export const moveCard = (cardId, data) => api.patch(`/cards/${cardId}/move`, data)

// [카드 상세 조회]
export const getCardById = (id) => api.get(`/cards/${id}`)

// [파일 업로드]
export const uploadCardAttachments = (id, formData) =>
  api.post(`/cards/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// [파일 삭제]
export const deleteCardAttachment = (id, attachmentId) =>
  api.delete(`/cards/${id}/attachments/${attachmentId}`)