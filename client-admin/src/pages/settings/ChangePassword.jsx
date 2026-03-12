import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import './Settings.css'

const ChangePassword = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    
    if (!validate()) return
    
    setLoading(true)
    
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        navigate('/dashboard/settings/profile')
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const password = formData.newPassword
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    if (score <= 2) return { score, label: 'Weak', color: '#EF4444' }
    if (score <= 3) return { score, label: 'Fair', color: '#F59E0B' }
    if (score <= 4) return { score, label: 'Good', color: '#10B981' }
    return { score, label: 'Strong', color: '#059669' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-content">
          <h1 className="settings-title">Change Password</h1>
          <p className="settings-subtitle">Update your password to keep your account secure</p>
        </div>
      </div>

      <div className="settings-content">
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

<div className="password-card" style={{ maxWidth: '800px', width: '100%' }}>
          {/* Enhanced Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Reset Your Password</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Create a strong password to protect your account</p>
          </div>

          <form onSubmit={handleSubmit} className="password-form">
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
<input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  className="form-input"
                  style={{ paddingRight: '48px', height: '48px', width: '100%' }}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '4px'
                  }}
                  onClick={() => togglePassword('current')}
                >
                  {showPasswords.current ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.currentPassword && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.currentPassword}</span>}
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
<input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  className="form-input"
                  style={{ paddingRight: '48px', height: '48px', width: '100%' }}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '4px'
                  }}
                  onClick={() => togglePassword('new')}
                >
                  {showPasswords.new ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.newPassword}</span>}
              
              {formData.newPassword && (
                <div className="password-requirements" style={{ marginTop: '16px' }}>
                  {/* Strength Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      flex: 1, 
                      height: '6px', 
                      background: '#E5E7EB', 
                      borderRadius: '3px',
                      overflow: 'hidden' 
                    }}>
                      <div style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`, 
                        height: '100%', 
                        background: passwordStrength.color,
                        transition: 'all 0.3s ease',
                        borderRadius: '3px'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', color: passwordStrength.color, fontWeight: 600, minWidth: '50px' }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Requirements */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    <div className="requirement-item">
                      <span style={{ color: formData.newPassword.length >= 8 ? '#10B981' : '#9CA3AF' }}>
                        {formData.newPassword.length >= 8 ? '✓' : '○'}
                      </span>
                      <span style={{ color: formData.newPassword.length >= 8 ? '#10B981' : '#9CA3AF', fontSize: '12px' }}>At least 8 characters</span>
                    </div>
                    <div className="requirement-item">
                      <span style={{ color: /[A-Z]/.test(formData.newPassword) ? '#10B981' : '#9CA3AF' }}>
                        {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'}
                      </span>
                      <span style={{ color: /[A-Z]/.test(formData.newPassword) ? '#10B981' : '#9CA3AF', fontSize: '12px' }}>One uppercase letter</span>
                    </div>
                    <div className="requirement-item">
                      <span style={{ color: /[a-z]/.test(formData.newPassword) ? '#10B981' : '#9CA3AF' }}>
                        {/[a-z]/.test(formData.newPassword) ? '✓' : '○'}
                      </span>
                      <span style={{ color: /[a-z]/.test(formData.newPassword) ? '#10B981' : '#9CA3AF', fontSize: '12px' }}>One lowercase letter</span>
                    </div>
                    <div className="requirement-item">
                      <span style={{ color: /\d/.test(formData.newPassword) ? '#10B981' : '#9CA3AF' }}>
                        {/\d/.test(formData.newPassword) ? '✓' : '○'}
                      </span>
                      <span style={{ color: /\d/.test(formData.newPassword) ? '#10B981' : '#9CA3AF', fontSize: '12px' }}>One number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
<input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  style={{ paddingRight: '48px', height: '48px', width: '100%' }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '4px'
                  }}
                  onClick={() => togglePassword('confirm')}
                >
                  {showPasswords.confirm ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.confirmPassword}</span>}
              
              {/* Match indicator */}
              {formData.confirmPassword && formData.newPassword && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: formData.confirmPassword === formData.newPassword ? '#10B981' : '#EF4444', fontSize: '12px' }}>
                    {formData.confirmPassword === formData.newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/dashboard/settings/profile')}
                style={{ flex: 1, justifyContent: 'center', height: '48px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Profile
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ flex: 1, justifyContent: 'center', height: '48px' }}
              >
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                    Changing...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword

