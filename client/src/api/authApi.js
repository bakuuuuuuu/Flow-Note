import axios from 'axios'
import api from './axios'

// [닉네임 중복 확인]
export const checkNickname = (nickname) => api.get('/users/check-nickname', { params: { nickname } })

// [회원가입]
export const register = (data) => api.post('/users/register', data)

// [로그인]
export const login = (data) => api.post('/users/login', data)

// [로그아웃]
export const logout = () => api.post('/users/logout')

// [토큰 재발급] 
export const refreshToken = () => axios.post('/api/users/refresh', {}, { withCredentials: true })

// [비밀번호 찾기 메일 발송]
export const forgotPassword = (data) => api.post('/users/forgot-password', data)

// [비밀번호 재설정]
export const resetPassword = (token, data) => api.patch(`/users/reset-password/${token}`, data)

// [내 프로필 조회]
export const getProfile = () => api.get('/users/profile')

// [프로필 이미지 업데이트]
export const updateProfileImage = (formData) => api.patch('/users/profile/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

// [프로필 이미지 삭제]
export const deleteProfileImage = () => api.delete('/users/profile/image')

// [프로필 수정]
export const updateProfile = (data) => api.patch('/users/profile', data)

// [비밀번호 변경 (로그인 상태)]
export const updatePassword = (data) => api.patch('/users/password', data)

// [회원 탈퇴]
export const deleteAccount = (data) => api.delete('/users/account', { data })

// [소셜 로그인 추가 정보 입력]
export const socialSetup = (data) => api.patch('/users/social-setup', data)