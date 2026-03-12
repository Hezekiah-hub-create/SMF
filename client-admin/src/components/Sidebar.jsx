import React, { useEffect, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMenuForRole } from '../data/menu'
import './Sidebar.css'
import * as Icons from 'lucide-react'
import logoImg from '../assets/logo.jpg'

const Sidebar = ({ collapsedProp = null, onToggle = () => {}, userProp = null }) => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    if (collapsedProp !== null) return collapsedProp
    try { return localStorage.getItem('sidebar-collapsed') === 'true' } catch { return false }
  })
  const [user, setUser] = useState(() => {
    if (userProp) return userProp
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

  // Update user when userProp changes
  useEffect(() => {
    if (userProp) {
      setUser(userProp)
    }
  }, [userProp])

  useEffect(() => {
    try { localStorage.setItem('sidebar-collapsed', collapsed ? 'true' : 'false') } catch {}
    onToggle(collapsed)
  }, [collapsed])

  // Get user's role
  const getUserRole = () => {
    if (!user) return null
    if (user.role) {
      return String(user.role).toLowerCase().trim()
    }
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return String(user.roles[0]).toLowerCase().trim()
    }
    return null
  }

  const userRole = getUserRole()

  // Get role-specific menu
  const visibleMenu = useMemo(() => {
    return getMenuForRole(userRole)
  }, [userRole])

  const handleCollapse = () => setCollapsed(s => !s)

  // Compute the active item based on current path
  const activeItemId = useMemo(() => {
    const currentPath = location.pathname
    for (const item of visibleMenu) {
      if (item.path === currentPath) {
        return item.id
      }
    }
    return null
  }, [visibleMenu, location.pathname])

  return (
    <aside className={"sidebar" + (collapsed ? ' collapsed' : '')} aria-label="Main navigation">
      <div className="sidebar-top">
        <div className="brand">
          <img src={logoImg} alt="University logo" className="brand-logo"/>
          {!collapsed && (
            <div className="brand-text">
              <div className="brand-title">Student Feedback System</div>
              <div className="brand-sub">Staff Portal</div>
            </div>
          )}
        </div>

        <button className="collapse-btn" onClick={handleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <Icons.ChevronsRight size={18} /> : <Icons.ChevronsLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {visibleMenu.map(item => {
          const Icon = Icons[item.icon] || Icons.ChevronsRight
          const active = item.id === activeItemId
          return (
            <Link
              to={item.path}
              key={item.id}
              className={"nav-item" + (active ? ' active' : '')}
              title={collapsed ? item.label : ''}
              aria-current={active ? 'page' : undefined}
            >
              <div className="nav-icon"><Icon size={18} /></div>
              {!collapsed && <div className="nav-label">{item.label}{item.badge ? <span className="nav-badge">{item.badge}</span> : null}</div>}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <Link to="/dashboard/settings/profile" className="nav-item bottom">
          <div className="nav-icon"><Icons.Settings size={18} /></div>
          {!collapsed && <div className="nav-label">Settings</div>}
        </Link>
        <Link to="/dashboard/help" className="nav-item bottom">
          <div className="nav-icon"><Icons.HelpCircle size={18} /></div>
          {!collapsed && <div className="nav-label">Help</div>}
        </Link>
        <button
          className="nav-item bottom danger"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('/login')
          }}
        >
          <div className="nav-icon"><Icons.LogOut size={18} /></div>
          {!collapsed && <div className="nav-label">Logout</div>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
