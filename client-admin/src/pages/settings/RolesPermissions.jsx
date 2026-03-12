import React from 'react'

// Role permissions definition
const rolePermissions = {
  admin: {
    name: 'System Administrator',
    description: 'Full system access and control',
    permissions: ['manage_users', 'manage_roles', 'view_all_feedback', 'manage_routing', 'view_logs', 'system_settings', 'reports']
  },
  hod: {
    name: 'Head of Department',
    description: 'Department-level management',
    permissions: ['view_department_feedback', 'assign_feedback', 'respond_feedback', 'escalate_feedback', 'view_reports']
  },
  lecturer: {
    name: 'Lecturer',
    description: 'Course-related feedback handling',
    permissions: ['view_assigned_feedback', 'respond_feedback', 'view_own_reports']
  },
  dean_faculty: {
    name: 'Dean of Faculty',
    description: 'Faculty-wide oversight',
    permissions: ['view_faculty_feedback', 'assign_feedback', 'respond_feedback', 'escalate_feedback', 'view_reports', 'compare_departments']
  },
  dean_students: {
    name: 'Dean of Students',
    description: 'Student welfare management',
    permissions: ['view_welfare_feedback', 'respond_feedback', 'view_referrals', 'manage_appointments']
  },
  src: {
    name: 'Student Representative',
    description: 'Student voice representation',
    permissions: ['view_own_feedback', 'submit_feedback', 'view_reports']
  },
  quality_assurance: {
    name: 'Quality Assurance',
    description: 'University-wide quality monitoring',
    permissions: ['view_all_feedback', 'view_reports', 'view_audit_logs', 'export_data']
  },
  admissions: {
    name: 'Admissions',
    description: 'Admission-related feedback',
    permissions: ['view_admission_feedback', 'respond_feedback', 'view_reports']
  },
  academic_affairs: {
    name: 'Academic Affairs',
    description: 'Academic policy feedback',
    permissions: ['view_academic_feedback', 'respond_feedback', 'view_reports']
  },
  counseling: {
    name: 'Counseling',
    description: 'Mental health support',
    permissions: ['view_counseling_feedback', 'respond_feedback', 'view_appointments', 'confidential_cases']
  },
  staff: {
    name: 'Staff',
    description: 'General staff access',
    permissions: ['view_assigned_feedback', 'respond_feedback']
  },
  student: {
    name: 'Student',
    description: 'Student user access',
    permissions: ['submit_feedback', 'view_own_feedback']
  },
  finance: {
    name: 'Finance',
    description: 'Finance department access',
    permissions: ['view_finance_dashboard', 'view_reports']
  }
}

const colors = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
}

// Icons as inline SVGs
const Icons = {
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
  ),
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  ),
}

const RolesPermissions = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <a 
            href="/dashboard/system" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '36px', 
              height: '36px', 
              background: '#fff', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              color: '#64748b',
              textDecoration: 'none'
            }}
          >
            <Icons.ArrowLeft />
          </a>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Roles & Permissions</h1>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', marginLeft: '48px' }}>
          View all system roles and their associated permissions
        </p>
      </div>

      {/* Roles Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '16px' 
      }}>
        {Object.entries(rolePermissions).map(([roleKey, roleData]) => {
          const roleColor = roleKey === 'admin' ? colors.danger : 
                          roleKey.includes('dean') ? colors.purple : 
                          roleKey === 'hod' ? colors.warning : colors.primary
          return (
            <div 
              key={roleKey} 
              style={{ 
                padding: '20px', 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: roleColor, 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Icons.Key />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{roleData.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{roleData.description}</div>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Permissions
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {roleData.permissions.map((perm, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        color: colors.primary, 
                        borderRadius: '4px', 
                        fontWeight: '500' 
                      }}
                    >
                      {perm.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RolesPermissions

