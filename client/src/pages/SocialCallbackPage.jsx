import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getProfile } from '../api/authApi'

const SocialCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAccessToken, setUser } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=' + error, { replace: true })
      return
    }

    if (token) {
      setAccessToken(token)
      getProfile().then(({ data }) => {
        setUser(data)
        // 추가 정보 미입력 신규 소셜 유저면 설정 페이지로
        if (!data.is_profile_complete) {
          navigate('/social-setup', { replace: true })
        } else {
          navigate('/home', { replace: true })
        }
      }).catch(() => {
        navigate('/login', { replace: true })
      })
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(232,234,240,0.5)', fontSize: '14px' }}>로그인 처리 중...</p>
    </div>
  )
}

export default SocialCallbackPage