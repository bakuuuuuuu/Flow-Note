import api from './axios'

// [통합 검색]
export const search = (keyword) => api.get('/search', { params: { q: keyword } })

// [검색 기록 저장]
export const saveSearchKeyword = (keyword) => api.post('/search/history', { keyword })

// [최근 검색어 조회]
export const getRecentSearches = () => api.get('/search/history')

// [검색 기록 삭제]
export const deleteSearchHistory = (id) => api.delete(`/search/history/${id}`)