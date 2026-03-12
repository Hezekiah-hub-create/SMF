import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import RoleSelector from '../../components/auth/RoleSelector'
import '../../pages/auth/auth.css'
import logoImg from '../../assets/logo.jpg'
import useBrandColors from '../../hooks/useBrandColors'

const Login = () => {
  useBrandColors(logoImg)
  const { login: authLogin } = useAuth()
  const [role, setRole] = useState('admin')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!identifier || !password) {
      setError('Please enter your email/ID and password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, password, remember }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || 'Invalid credentials')
        setLoading(false)
        return
      }
      const data = await res.json()
      // Store token and user in auth context
      await authLogin(data)
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-brand flex flex-col items-center justify-center text-center p-8 rounded-right-top-bottom-2xl">
        <div className="logo flex mb-4 justify-center">
            <img src="src/assets/logo.jpg" alt="" className='rounded-2xl w-50 h-50'/>
        </div>
        <h1 className='text-2xl font-bold'>Student FeedBack <br />Management System</h1>
        <p className='font-bold text-xl'>Welcome back, Enter your credencials to Sign-in.</p>
      </div>

      <div className="auth-card-wrap">
        <div className="auth-card" role="main">
          <h2 className='flex text-2xl font-medium'>Sign In</h2>
          <p className="muted">Access your dashboard</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
            {/* <div className="form-row">
              <label>Role</label>
              <RoleSelector value={role} onChange={setRole} />
            </div> */}

            <div className="form-row">
              <label>Username / Email</label>
              <input
                className="text-input"
                placeholder="Enter your email or ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Password</label>
              <input
                className="text-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div style={{ color: '#E53935', marginBottom: 12 }}>{error}</div>}

            <div className="controls">
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={remember} onChange={() => setRemember((v) => !v)} />
                <span className="muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="muted">Forgot Password?</Link>
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span className="muted">Don’t have an account? </span>
              <Link to="/register">Register</Link>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login