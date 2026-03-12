import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './Topbar.css'
import authService from '../services/authService'
import logoImg from '../assets/logo.jpg'
import CustomSelect from './ui/CustomSelect'
import './ui/CustomSelect.css'
import { useNotifications } from '../hooks/useNotifications'

// Department options for filter
const departmentOptions = [
  { value: '', label: 'All departments' },
  { value: 'cs', label: 'Computer Science' },
  { value: 'eng', label: 'Engineering' },
  { value: 'math', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
]

// SVG Icons as components
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

// Fallback sample notifications when API fails or for demo
const sampleNotifications = [
	{ id: 1, type: 'assigned', title: 'New feedback assigned', desc: 'Feedback #F-2025-009 assigned to you', time: '2 hours ago', icon: 'mail', category: 'Assigned', read: false },
	{ id: 2, type: 'escalated', title: 'Escalated case', desc: 'Escalated by Dept. Staff', time: '6 hours ago', icon: 'warning', category: 'Escalated', read: false },
	{ id: 3, type: 'resolved', title: 'Case resolved', desc: 'Feedback #F-2025-008 marked as resolved', time: '1 day ago', icon: 'check', category: 'Resolved', read: true },
]

const Topbar = ({ pageTitle = 'Dashboard', breadcrumbs = [], onToggle = () => {} , user = null}) => {
	const navigate = useNavigate()
	const [displayUser, setDisplayUser] = useState(user || { name: 'Guest', role: 'User' })
	const [search, setSearch] = useState('')
	const [selectedDepartment, setSelectedDepartment] = useState('')
	const [showNotifications, setShowNotifications] = useState(false)
	const [showProfile, setShowProfile] = useState(false)
	const searchRef = useRef(null)
	const notifRef = useRef(null)
	const profileRef = useRef(null)

	// Use role-based notifications hook
	const { notifications: roleNotifications, unreadCount, loading: notifLoading, markAsRead: markNotificationRead } = useNotifications(10)

	// Use role-based notifications or fall back to sample notifications
	const displayNotifications = roleNotifications.length > 0 ? roleNotifications : sampleNotifications
	const displayUnreadCount = roleNotifications.length > 0 ? unreadCount : sampleNotifications.filter(n => !n.read).length

	useEffect(() => {
		if (user) {
			setDisplayUser(user)
		}
	}, [user])

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
				e.preventDefault()
				searchRef.current?.focus()
			}
			if (e.key === 'Escape') {
				setShowNotifications(false)
				setShowProfile(false)
			}
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [])

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
			if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const clearSearch = () => setSearch('')

	const handleMarkAsRead = (id) => {
		if (roleNotifications.length > 0) {
			markNotificationRead(id)
		} else {
			// Fallback: just update local state for demo
		}
	}

	const getTypeBadgeClass = (type) => {
		const typeMap = { assigned: 'badge-blue', escalated: 'badge-red', resolved: 'badge-green', routing: 'badge-blue', info: 'badge-gray' }
		return typeMap[type] || 'badge-gray'
	}

	// Get icon based on notification type
	const getNotificationIcon = (iconType) => {
		switch (iconType) {
			case 'mail': return <MailIcon />
			case 'warning': return <WarningIcon />
			case 'check': return <CheckIcon />
			default: return <InfoIcon />
		}
	}

	const handleLogout = async () => {
		try {
			await authService.logout()
		} catch (err) {
			// ignore network/logout errors but continue clearing client state
		}
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		setShowProfile(false)
		// replace to avoid keeping previous page in history
		window.location.replace('/auth/login')
	}

	const handleNavigate = (path) => {
		setShowProfile(false)
		navigate(path)
	}

	return (
		<header className="topbar" role="banner">
			<div className="topbar-inner">
				<div className="topbar-center">
					{/* <div className="search">
						<svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
							<path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
							<circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.5"/>
						</svg>
						<input
							ref={searchRef}
							className="search-input"
							placeholder="Search feedback ID, student name, keyword..."
							aria-label="Global search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						{search && (
							<button onClick={clearSearch} className="clear-btn" aria-label="Clear search">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
									<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>
						)}
						<div style={{ minWidth: '160px' }}>
							<CustomSelect
								value={selectedDepartment}
								onChange={setSelectedDepartment}
								options={departmentOptions}
								placeholder="All departments"
								clearable={true}
							/>
						</div>
					</div> */}
				</div>

				<div className="topbar-right">
					<div className="icon-group">
						<div className="notif-wrap" ref={notifRef}>
							<button className="icon-btn notif-btn" aria-haspopup="true" aria-expanded={showNotifications} onClick={() => setShowNotifications(s => !s)} aria-label="Notifications">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className='bell-icon'>
									<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
								{unreadCount > 0 && <span className="badge" aria-hidden>{unreadCount > 9 ? '9+' : unreadCount}</span>}
							</button>

							{showNotifications && (
								<div className="dropdown notifications-dropdown" role="dialog" aria-label="Notifications panel">
									<div className="notif-header">
										<div className="notif-header-title">Notifications</div>
										{unreadCount > 0 && <div className="notif-header-count">{unreadCount} new</div>}
									</div>
									<div className="notif-divider"></div>
									<div className="notif-list">
										{sampleNotifications.length > 0 ? (
											sampleNotifications.map(n => (
												<div key={n.id} className="notif-item">
													<div className="notif-left">
														<div className="notif-icon-circle">
															{n.icon === 'mail' && <MailIcon />}
															{n.icon === 'warning' && <WarningIcon />}
															{n.icon === 'check' && <CheckIcon />}
														</div>
													</div>
													<div className="notif-body">
														<div className="notif-title-row">
															<div className="notif-title">{n.title}</div>
															<span className={`notif-badge ${getTypeBadgeClass(n.type)}`}>{n.category}</span>
														</div>
														<div className="notif-desc">{n.desc}</div>
														<div className="notif-time">{n.time}</div>
													</div>
													<div className="notif-action">
														<button className="notif-action-btn" onClick={() => markAsRead(n.id)} title="Mark as read"><CheckIcon /></button>
													</div>
												</div>
											))
										) : (
											<div className="notif-empty">No notifications</div>
										)}
									</div>
									<div className="notif-divider"></div>
									<div className="notif-footer">
										<a href="#" className="notif-footer-link">View all notifications</a>
									</div>
								</div>
							)}
						</div>

						<div className="term-pill" aria-hidden>2025/2026 – Sem 1</div>

						<div className="profile" ref={profileRef}>
							<button className="profile-btn" onClick={() => setShowProfile(s => !s)} aria-haspopup="true" aria-expanded={showProfile}>
								<img src={logoImg} alt="logo" className="avatar"/>
								<div className="profile-meta">
									<div className="profile-name">{displayUser.name}</div>
									<div className="profile-role">{displayUser.role}</div>
								</div>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
									<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>

							{showProfile && (
								<div className="dropdown profile-dropdown" role="menu" aria-label="Profile menu">
									<div className="profile-head">
										<img src={logoImg} alt="logo" className="avatar-lg"/>
										<div>
											<div className="profile-name">{displayUser.name}</div>
											<div className="profile-role">{displayUser.role}</div>
										</div>
									</div>
									<div className="dropdown-list">
										<button className="dropdown-item" onClick={() => handleNavigate('/dashboard/settings/profile')}>My Profile</button>
										<button className="dropdown-item" onClick={() => handleNavigate('/dashboard/settings/account')}>Account Settings</button>
										<button className="dropdown-item" onClick={() => handleNavigate('/dashboard/settings/password')}>Change Password</button>
										<button className="dropdown-item danger" onClick={handleLogout}>Logout</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}

export default Topbar
