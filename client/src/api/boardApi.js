import api from './axios'

// [보드 생성]
export const createBoard = (data) => api.post('/boards', data)

// [내 보드 목록 조회]
export const getBoards = () => api.get('/boards')

// [특정 보드 상세 조회]
export const getBoardById = (id) => api.get(`/boards/${id}`)

// [보드 정보 수정]
export const updateBoard = (id, data) => api.patch(`/boards/${id}`, data)

// [보드 삭제]
export const deleteBoard = (id) => api.delete(`/boards/${id}`)