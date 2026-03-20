import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import { refreshToken, getProfile } from './api/authApi'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import BoardListPage from './pages/BoardListPage'
import BoardPage from './pages/BoardPage'

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore()
  return !isLoggedIn ? children : <Navigate to="/home" replace />
}

function App() {
  const { setAccessToken, setUser } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    useThemeStore.getState().initTheme()
  }, [])

  // 앱 시작할 때 RefreshToken으로 로그인 상태 복구
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await refreshToken()
        setAccessToken(data.accessToken)
        const { data: user } = await getProfile()
        setUser(user)
      } catch {
        // 실패하면 로그인 안 된 상태로 둬요
      } finally {
        setAuthChecked(true)
      }
    }
    tryRefresh()
  }, [])

  // 로그인 상태 확인 전엔 아무것도 렌더링 안 해요
  // 안 그러면 로그인 됐는데도 잠깐 로그인 페이지가 보일 수 있어요
  if (!authChecked) return null

  return (
    <BrowserRouter>
      <Routes>
        {/* 랜딩 */}
        <Route path="/" element={<LandingPage />} />

        {/* 인증 페이지 */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        </Route>

        {/* 메인 페이지 - MainLayout 적용 */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/home"      element={<BoardListPage mode="all" />} />
          <Route path="/priority"  element={<BoardListPage mode="priority" />} />
          <Route path="/starred"   element={<BoardListPage mode="starred" />} />
          <Route path="/board/:id" element={<BoardPage />} />
          <Route path="/search"    element={<div>검색 준비중</div>} />
          <Route path="/mypage"    element={<div>마이페이지 준비중</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App