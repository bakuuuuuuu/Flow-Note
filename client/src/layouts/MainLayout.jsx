import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import MainHeader from '../components/layout/MainHeader'
import MainSidebar from '../components/layout/MainSidebar'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)]">

      {/* 헤더 */}
      <MainHeader onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex pt-[72px]">

        {/* 사이드바 */}
        <MainSidebar open={sidebarOpen} />

        {/* 메인 콘텐츠 */}
        <main
          className="flex-1 min-h-[calc(100vh-72px)] transition-all duration-200"
          style={{ marginLeft: sidebarOpen ? '260px' : '64px' }}
        >
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default MainLayout