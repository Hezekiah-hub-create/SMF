import { useAuth } from '../context/AuthContext'

/**
 * Custom hook for getting user information
 * Combines AuthContext with localStorage fallback
 * @returns {object} User info including name, role, department, faculty
 */
export const useUser = () => {
  const { user } = useAuth()

  const getUserInfo = () => {
    if (user) {
      return {
        department: user.department || '',
        name: user.name || '',
        role: user.role || '',
        faculty: user.faculty || ''
      }
    }
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      return {
        department: localUser.department || '',
        name: localUser.name || '',
        role: localUser.role || '',
        faculty: localUser.faculty || ''
      }
    } catch {
      return { department: '', name: '', role: '', faculty: '' }
    }
  }

  const userInfo = getUserInfo()

  return {
    user,
    ...userInfo,
    isHOD: userInfo.role === 'hod',
    isDean: userInfo.role === 'dean_faculty',
    isDeanOfStudents: userInfo.role === 'dean_students',
    isAdmin: ['admin', 'quality_assurance', 'admissions', 'academic_affairs', 'counseling'].includes(userInfo.role)
  }
}

export default useUser
