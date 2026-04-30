import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
})

// 요청 인터셉터 - 모든 요청에 accessToken 자동 첨부
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터 - 토큰 만료 시 자동 재발급
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고 재시도 안 한 요청이면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // refreshToken으로 새 accessToken 발급
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/refresh`, {}, {
          withCredentials: true
        })

        // 새 토큰 저장
        useAuthStore.getState().setAccessToken(data.accessToken)

        // 실패했던 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // refresh도 실패하면 로그아웃
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api