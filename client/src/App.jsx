import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import { refreshToken, getProfile } from './api/authApi'
import AuthLayout from "./components/layout/AuthLayout"
import MainLayout from "./components/layout/MainLayout"
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import BoardListPage from './pages/BoardListPage'
import BoardPage from './pages/BoardPage'
import MyPage from './pages/MyPage'
import SearchPage from './pages/SearchPage'
import SocialCallbackPage from './pages/SocialCallbackPage'
import SocialSetupPage from './pages/SocialSetupPage'

// 로그인 안 된 유저 차단
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuthStore()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (user && !user.is_profile_complete) return <Navigate to="/social-setup" replace />
  return children
}

// 로그인 된 유저 차단
const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore()
  return !isLoggedIn ? children : <Navigate to="/home" replace />
}

// 소셜 설정 페이지 전용 가드
// 로그인 안 됐으면 로그인으로, 프로필 완성됐으면 홈으로
const SocialSetupRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuthStore()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (user?.is_profile_complete) return <Navigate to="/home" replace />
  return children
}

function App() {
  const { setAccessToken, setUser } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    useThemeStore.getState().initTheme()
  }, [])

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await refreshToken()
        setAccessToken(data.accessToken)
        const { data: user } = await getProfile()
        setUser(user)
      } catch {
      } finally {
        setAuthChecked(true)
      }
    }
    tryRefresh()
  }, [])

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

        {/* 메인 페이지 */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/home"      element={<BoardListPage mode="all" />} />
          <Route path="/priority"  element={<BoardListPage mode="priority" />} />
          <Route path="/starred"   element={<BoardListPage mode="starred" />} />
          <Route path="/board/:id" element={<BoardPage />} />
          <Route path="/search"    element={<SearchPage />} />
          <Route path="/mypage"    element={<MyPage />} />
        </Route>

        {/* 소셜 로그인 콜백 */}
        <Route path="/auth/callback" element={<SocialCallbackPage />} />
        <Route path="/social-setup" element={<SocialSetupRoute><SocialSetupPage /></SocialSetupRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App