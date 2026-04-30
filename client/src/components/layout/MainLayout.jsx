import { Outlet, useLocation } from 'react-router-dom'
import MainHeader from './MainHeader'
import MainSidebar from './MainSidebar'
import useSidebarStore from '../../store/sidebarStore'

const MainLayout = () => {
  const { isOpen, toggle } = useSidebarStore()
  const location = useLocation()
  const isMyPage = location.pathname === '/mypage'

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <MainHeader onToggleSidebar={toggle} hideToggle={isMyPage} />
      <div className="flex pt-[72px]">
        {!isMyPage && <MainSidebar open={isOpen} />}
        <main
          className="flex-1 min-h-[calc(100vh-72px)] transition-all duration-200 overflow-hidden w-0"
          style={{
            marginLeft: isMyPage ? '0' : isOpen ? '260px' : '64px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout