import React, { useState } from 'react'
import './Settings.css'

const AccountSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    twoFactorAuth: false,
    sessionTimeout: '30'
  })

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-content">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">Manage your account preferences and notifications</p>
        </div>
      </div>

      <div className="settings-content">
        <div className="account-settings-card">
          <div className="settings-group">
            <h3 className="settings-group-title">Notifications</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Email Notifications</span>
                <span className="setting-description">Receive email updates about your account</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Push Notifications</span>
                <span className="setting-description">Receive push notifications on your device</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Weekly Digest</span>
                <span className="setting-description">Receive a weekly summary of activities</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-group">
            <h3 className="settings-group-title">Security</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Two-Factor Authentication</span>
                <span className="setting-description">Add an extra layer of security to your account</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Session Timeout</span>
                <span className="setting-description">Automatically log out after inactivity</span>
              </div>
              <select 
                name="sessionTimeout" 
                className="form-input" 
                style={{ width: 'auto', minWidth: '150px' }}
                value={settings.sessionTimeout}
                onChange={handleChange}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="0">Never</option>
              </select>
            </div>
          </div>

          <div className="settings-group">
            <h3 className="settings-group-title">Data & Privacy</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Download My Data</span>
                <span className="setting-description">Export all your data in a portable format</span>
              </div>
              <button className="btn btn-secondary">
                Download
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Delete Account</span>
                <span className="setting-description">Permanently delete your account and data</span>
              </div>
              <button className="btn btn-secondary" style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettings
