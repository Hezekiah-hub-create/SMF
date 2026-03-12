import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import logo from '../../assets/logo.jpg'
import './Settings.css'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    role: user?.role || '',
    phone: user?.phone || '',
    title: user?.title || ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        role: user.role || '',
        phone: user.phone || '',
        title: user.title || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const updatedUser = await authService.updateProfile(formData)
      updateUser(updatedUser)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      admin: 'System Administrator',
      staff: 'Staff',
      lecturer: 'Lecturer',
      hod: 'Head of Department',
      dean_faculty: 'Dean of Faculty',
      dean_students: 'Dean of Students',
      admissions: 'Admissions Officer',
      quality_assurance: 'Quality Assurance',
      academic_affairs: 'Academic Affairs',
      counseling: 'Counselor'
    }
    return roleMap[role] || role
  }

  const quickActions = [
    {
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      color: '#6366f1',
      action: () => navigate('/dashboard/settings/account')
    },
    {
      title: 'Change Password',
      description: 'Update your security password',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      color: '#10b981',
      action: () => navigate('/dashboard/settings/password')
    }
  ]

  return (
    <div className="settings-page">
        <div className="settings-header">
        <div className="settings-header-content">
          <h1 className="settings-title">My Profile</h1>
          <p className="settings-subtitle">Manage your personal information and account settings</p>
        </div>
        </div>

      <div className="settings-content">
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-header-section">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large-wrapper">
                <img 
                  src={logo} 
                  alt="Profile" 
                  className="profile-avatar-image"
                />
              </div>
              <div className="profile-header-info">
                <h2 className="profile-name">{formData.name || 'User'}</h2>
                <span className="profile-role-badge">{getRoleDisplayName(formData.role)}</span>
              </div>
            </div>
            {!isEditing && (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={getRoleDisplayName(formData.role)}
                    disabled
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setMessage({ type: '', text: '' }); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{formData.name || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{formData.email || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{formData.phone || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{formData.department || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Title</span>
                <span className="info-value">{formData.title || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value">{getRoleDisplayName(formData.role)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid w-full">
            {quickActions.map((action, index) => (
              <button 
                key={index} 
                className="action-card" 
                onClick={action.action}
                style={{ borderColor: 'transparent' }}
              >
                <div 
                  className="action-icon" 
                  style={{ 
                    background: `${action.color}15`,
                    color: action.color
                  }}
                >
                  {action.icon}
                </div>
                <span className="action-title">{action.title}</span>
                <span className="action-desc">{action.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
