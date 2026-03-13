import { useNavigate } from 'react-router-dom'
import { Github, Youtube, BookOpen } from 'lucide-react'
import Button from '../components/common/Button'
import LogoButton from '../components/common/LogoButton'

const LandingPage = () => {
  const navigate = useNavigate()

  const scrollToFeatures = () => {
    const section = document.getElementById('features')
    const header = document.querySelector('header')
    const headerHeight = header ? header.offsetHeight : 0
    const top = section.getBoundingClientRect().top + window.scrollY - headerHeight
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">

      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-2 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <LogoButton />
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/register')}>Sign up</Button>
          <Button onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </header>

      {/* 히어로 섹션 */}
<section className="relative flex flex-col items-center justify-center text-center h-screen"
  style={{ overflow: 'hidden' }}>

  {/* 비디오 배경 */}
  <video
    autoPlay muted loop playsInline
    src="/auth-bg.mp4"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '100%',
      minHeight: '100%',
      width: 'auto',
      height: 'auto',
    }}
  />

        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">효율적인 업무의 시작!</h1>
          <p className="text-white/80 text-lg">마크다운 노트와 칸반보드를 한번으로, 당신만의 업무 흐름을 완성하세요.</p>
          <Button size="lg" onClick={() => navigate('/register')}>지금 무료로 시작하기</Button>
        </div>

        {/* 아래로 스크롤 화살표 */}
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
          style={{ background: 'none', border: 'none' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32" height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'bounce 2s infinite' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(6px); opacity: 1; }
          }
        `}</style>
      </section>

      {/* 핵심 기능 섹션 */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-3">
        {[
          { bg: '/feature-1.jpg', title: '자유로운 기록', desc: '마크다운 형식을 지원하여 쉽고 빠르게 노트를 작성하세요.', label: null },
          { bg: '/feature-2.jpg', title: '직관적인 관리', desc: '드래그 앤 드롭으로 업무의 진행 상태를 파악하세요.', label: 'Flow-Note의 핵심 기능' },
          { bg: '/feature-3.jpg', title: '한눈에 보는 일정', desc: '달력 뷰를 통해 전체 업무 일정을 놓치지 마세요.', label: null },
        ].map((item) => (
          <div
            key={item.title}
            className="relative bg-cover bg-center flex flex-col items-center justify-end p-10"
            style={{ backgroundImage: `url('${item.bg}')`, minHeight: '850px' }}
          >
            <div className="absolute inset-0 bg-black/40" />
            {/* 가운데 카드에만 표시되는 상단 라벨 */}
            {item.label && (
              <p className="absolute top-8 left-0 right-0 text-center text-white font-bold text-2xl z-10">
                {item.label}
              </p>
            )}
            <div className="relative z-10 text-center">
              <h3 className="text-white font-bold text-2xl mb-3">{item.title}</h3>
              <p className="text-white/80 text-sm mb-5">{item.desc}</p>
              <button className="px-5 py-2 text-sm font-medium text-white border border-white/50 rounded-full hover:bg-white/20 transition-colors">
                자세히 보기 →
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* 푸터 */}
      <footer className="bg-[#1a1a1a] text-white px-8 py-10">
        <div className="flex items-center gap-2 mb-2">
          <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />
          <span className="font-bold">Flow-Note</span>
        </div>
        <p className="text-white/50 text-sm mb-4">당신의 모든 기록이 자신이 되는 공간, Flow-Note</p>
        <div className="flex gap-3 mb-8">
          <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <Github size={16} />
          </a>
          <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <Youtube size={16} />
          </a>
          <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <BookOpen size={16} />
          </a>
        </div>
        <div className="flex justify-between text-white/30 text-xs">
          <span>© 2026 Flow-Note. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white">이용약관</span>
            <span className="cursor-pointer hover:text-white">개인정보처리방침</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage