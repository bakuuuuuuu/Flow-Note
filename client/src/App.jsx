import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import AuthLayout from './layouts/AuthLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore()
  return !isLoggedIn ? children : <Navigate to="/home" replace />
}

function App() {
  useEffect(() => {
    useThemeStore.getState().initTheme()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* 랜딩 */}
        <Route path="/" element={<LandingPage />} />

        {/* 인증 페이지 - AuthLayout 적용 */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        </Route>

        {/* 프라이빗 라우트 */}
        <Route path="/home" element={<PrivateRoute><div>홈 준비중</div></PrivateRoute>} />
        <Route path="/board/:id" element={<PrivateRoute><div>보드 준비중</div></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><div>검색 준비중</div></PrivateRoute>} />
        <Route path="/mypage" element={<PrivateRoute><div>마이페이지 준비중</div></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App