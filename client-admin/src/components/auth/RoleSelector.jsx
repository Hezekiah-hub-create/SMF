import React, { useState } from 'react'

const roles = [
  { key: 'admin', label: 'System Administrator' },
  { key: 'lecturer', label: 'Lecturer / Department Staff' },
  { key: 'hod', label: 'Head of Department' },
  { key: 'dean_faculty', label: 'Dean of Faculty' },
  { key: 'dean_students', label: 'Dean of Students' },
  { key: 'src', label: 'SRC' },
  { key: 'quality_assurance', label: 'Quality Assurance' },
  { key: 'admissions', label: 'Admissions Officer' },
  { key: 'academic_affairs', label: 'Director of Academic Affairs' },
  { key: 'counseling', label: 'Counseling Officer' },
]

const RoleSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedRole = roles.find((r) => r.key === value)

  const handleSelect = (roleKey) => {
    onChange(roleKey)
    setIsOpen(false)
  }

  return (
    <div className="role-selector-wrapper">
      <button
        type="button"
        className="role-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedRole?.label || 'Select Role'}
      </button>

      {isOpen && (
        <>
          <div className="role-popup-overlay" onClick={() => setIsOpen(false)} />
          <div className="role-popup">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`role-popup-item ${value === r.key ? 'active' : ''}`}
                onClick={() => handleSelect(r.key)}
              >
                {value === r.key && <span className="role-checkmark">✓</span>}
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default RoleSelector
