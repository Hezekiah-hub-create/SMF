// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../../context/AuthContext'
// import RoleSelector from '../../components/auth/RoleSelector'
// import '../../pages/auth/auth.css'
// import logoImg from '../../assets/logo.jpg'
// import useBrandColors from '../../hooks/useBrandColors'

// const Register = () => {
//   useBrandColors(logoImg)
//   const { login: authLogin } = useAuth()
//   const [role, setRole] = useState('lecturer')
//   const [fullName, setFullName] = useState('')
//   const [email, setEmail] = useState('')
//   const [phone, setPhone] = useState('')
//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirm, setConfirm] = useState('')
//   const [studentId, setStudentId] = useState('')
//   const [department, setDepartment] = useState('')
//   const [level, setLevel] = useState('')
//   const [staffId, setStaffId] = useState('')
//   const [agree, setAgree] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const navigate = useNavigate()

//   const isStaff = role === 'lecturer' || role === 'hod' || role === 'dean_faculty' || role === 'dean_students' || role === 'src' || role === 'quality_assurance' || role === 'admissions' || role === 'academic_affairs' || role === 'counseling' || role === 'admin'

//   const valid = () => {
//     if (!fullName || !email || !username || !password || !confirm) return false
//     if (password !== confirm) return false
//     if (!agree) return false
//     if (isStaff && (!staffId || !department)) return false
//     return true
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     if (!valid()) {
//       setError('Please complete all required fields and agree to the policy.')
//       return
//     }
//     setLoading(true)
//     try {
//       const payload = { role, fullName, email, phone, username, password }
//       // Only staff roles need staff-specific fields
//       if (isStaff) Object.assign(payload, { staffId, department })

//       const res = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       })
//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}))
//         setError(data.message || 'Registration failed')
//         setLoading(false)
//         return
//       }
//       const data = await res.json()
//       // Store token and user in auth context, then redirect to dashboard
//       await authLogin(data)
//       navigate('/dashboard')
//     } catch (err) {
//       setError('Network error. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="auth-split bg-accent">
//       <div className="auth-brand flex flex-col items-center justify-center text-center p-8">
//         <div className="logo flex mb-4 justify-center">
//             <img src="src/assets/logo.jpg" alt="" className='rounded-2xl w-50 h-50'/>
//         </div>
//         <h1 className='text-2xl font-bold'>Student FeedBack <br />Management System</h1>
//         <p className='font-bold text-2xl'>Create an account to access your role-specific dashboard.</p>
//       </div>

//       <div className="auth-card-wrap">
//         <div className="auth-card" role="main">
//           <h2 className='flex text-2xl font-medium'>Register</h2>
//           <p className="muted">Create your account</p>

//           <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
//             <div className="form-row">
//               <label>Role</label>
//               <RoleSelector value={role} onChange={setRole} />
//             </div>

//             <div className="form-row">
//               <label>Full Name</label>
//               <input className="text-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
//             </div>

//             <div className="form-row">
//               <label>Email Address</label>
//               <input className="text-input" value={email} onChange={(e) => setEmail(e.target.value)} />
//             </div>

//             {/* <div className="form-row">
//               <label>Phone Number</label>
//               <input className="text-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
//             </div> */}

//             <div className="form-row">
//               <label>Username / ID</label>
//               <input className="text-input" value={username} onChange={(e) => setUsername(e.target.value)} />
//             </div>

//             <div className="form-row">
//               <label>Password</label>
//               <input className="text-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//             </div>

//             <div className="form-row">
//               <label>Confirm Password</label>
//               <input className="text-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
//             </div>

//             {isStaff && (
//               <>
//                 <div className="form-row">
//                   <label>Staff ID</label>
//                   <input className="text-input" value={staffId} onChange={(e) => setStaffId(e.target.value)} />
//                 </div>
//                 <div className="form-row">
//                   <label>Department</label>
//                   <input className="text-input" value={department} onChange={(e) => setDepartment(e.target.value)} />
//                 </div>
//               </>
//             )}

//             {error && <div style={{ color: '#E53935', marginBottom: 12 }}>{error}</div>}

//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//               <input type="checkbox" checked={agree} onChange={() => setAgree((v) => !v)} />
//               <div className="muted">I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link></div>
//             </div>

//             <button className="primary-btn" type="submit" disabled={loading || !valid()}>
//               {loading ? 'Registering...' : 'Register'}
//             </button>

//             <div style={{ marginTop: 12, textAlign: 'center' }}>
//               <span className="muted">Already have an account? </span>
//               <Link to="/login">Sign in</Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Register