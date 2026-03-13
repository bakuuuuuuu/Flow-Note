import { Outlet } from 'react-router-dom'
// import Header from '../components/header/Header'
// import Sidebar from '../components/sidebar/Sidebar'

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-surface dark:bg-dark-bg">
      {/* 헤더 */}
      <div className="h-14 shrink-0">
        {/* <Header /> */}
        <div className="h-full bg-white dark:bg-dark-surface border-b border-border-light dark:border-dark-border" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <div className="w-60 shrink-0">
          {/* <Sidebar /> */}
          <div className="h-full bg-white dark:bg-dark-surface border-r border-border-light dark:border-dark-border" />
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout