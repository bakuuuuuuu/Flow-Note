import { Outlet } from 'react-router-dom'
import LogoButton from '../components/common/LogoButton'

const AuthLayout = () => {
  return (
    <div className="relative flex h-screen w-full overflow-hidden">

      {/* 전체 배경 동영상 */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/auth-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* 왼쪽 상단 로고 버튼 */}
      <div className="absolute top-[10px] left-[25px] z-10">
        <LogoButton />
      </div>

      {/* 오른쪽 폼 패널
          피그마 기준: 전체 1440px 중 오른쪽 590px (약 41%)
          backdrop-blur(10px) + rgba(0,0,0,0.5) + 왼쪽 테두리 rgba(255,255,255,0.15) */}
      <div
        className="absolute right-0 top-0 h-full flex flex-col justify-center overflow-y-auto z-10"
        style={{
          width: 'clamp(400px, 45vw, 600px)',
          paddingLeft: 'clamp(40px, 8%, 115px)',
          paddingRight: 'clamp(40px, 8%, 115px)',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderLeft: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout