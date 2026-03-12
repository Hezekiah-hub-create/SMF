import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar first in DOM - Hidden on mobile; supports collapsed state on desktop */}
        <div className="hidden lg:block">
          <Sidebar collapsedProp={collapsed} onToggle={() => setCollapsed(prev => !prev)} userProp={user} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Topbar placed inside content so sidebar appears first in DOM */}
          <Topbar onToggle={() => setCollapsed(prev => !prev)} user={user} />

          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {/* This can be implemented with state management for mobile menu */}
    </div>
  )
}

export default DashboardLayout
