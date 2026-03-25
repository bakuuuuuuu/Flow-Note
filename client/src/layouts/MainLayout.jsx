import { Outlet } from 'react-router-dom'
import MainHeader from '../components/layout/MainHeader'
import MainSidebar from '../components/layout/MainSidebar'
import useSidebarStore from '../store/sidebarStore'

const MainLayout = () => {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <MainHeader onToggleSidebar={toggle} />
      <div className="flex pt-[72px]">
        <MainSidebar open={isOpen} />
        <main
          className="flex-1 min-h-[calc(100vh-72px)] transition-all duration-200 overflow-hidden w-0"
          style={{
            marginLeft: isOpen ? '260px' : '64px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout