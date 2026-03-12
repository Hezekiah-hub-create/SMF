// SVG Icons as components
const TrendUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23.5 15 6 13.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TrendDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

const PeopleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const BoltIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const CircleIcon = ({ color = '#ef4444' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const AssignmentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const DescriptionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const HourglassIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 22h14"/>
    <path d="M5 2h14"/>
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
  </svg>
);

const TimerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8"/>
    <polyline points="12 9 12 13 14.5 15.5"/>
    <path d="M12 1v2"/>
    <path d="M12 21v2"/>
    <path d="M4.22 4.22l1.42 1.42"/>
    <path d="M18.36 18.36l1.42 1.42"/>
    <path d="M1 12h2"/>
    <path d="M21 12h2"/>
    <path d="M4.22 19.78l1.42-1.42"/>
    <path d="M18.36 5.64l1.42-1.42"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// Icon renderer component
const renderIcon = (iconName) => {
  switch(iconName) {
    case 'people': return <PeopleIcon />;
    case 'check': return <CheckIcon />;
    case 'bolt': return <BoltIcon />;
    case 'trending-up': return <TrendingUpIcon />;
    case 'bar-chart': return <BarChartIcon />;
    case 'circle': return <CircleIcon />;
    case 'folder': return <FolderIcon />;
    case 'assignment': return <AssignmentIcon />;
    case 'edit': return <EditIcon />;
    case 'description': return <DescriptionIcon />;
    case 'link': return <LinkIcon />;
    case 'hourglass': return <HourglassIcon />;
    case 'timer': return <TimerIcon />;
    case 'arrow-up': return <ArrowUpIcon />;
    case 'warning': return <WarningIcon />;
    default: return null;
  }
};

export const StatsCard = ({ title, value, icon, trend }) => (
  <div style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e6e9ee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    flex: 1,
    minWidth: '200px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px 0' }}>{title}</p>
        <h3 style={{ color: '#4169e1', fontSize: '28px', margin: '0', fontWeight: 'bold' }}>{value}</h3>
        {trend && <p style={{ color: trend > 0 ? '#10b981' : '#ef4444', fontSize: '12px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {trend > 0 ? <TrendUpIcon /> : <TrendDownIcon />} {Math.abs(trend)}%
        </p>}
      </div>
      {icon && <div style={{ fontSize: '24px' }}>{renderIcon(icon)}</div>}
    </div>
  </div>
)

export const FeedbackTable = ({ data, onViewDetails, onRespond, onChangeStatus }) => (
  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e6e9ee', overflow: 'hidden' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e6e9ee' }}>
          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>ID</th>
          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Title</th>
          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Type</th>
          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Priority</th>
          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Status</th>
          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px', fontSize: '13px', color: '#1f2937' }}>{item.id}</td>
            <td style={{ padding: '12px', fontSize: '13px', color: '#1f2937' }}>{item.title}</td>
            <td style={{ padding: '12px', fontSize: '13px', color: '#1f2937' }}>{item.type}</td>
            <td style={{ padding: '12px', fontSize: '13px' }}>
              <span style={{
                background: item.priority === 'High' ? '#fee2e2' : item.priority === 'Medium' ? '#fef3c7' : '#dbeafe',
                color: item.priority === 'High' ? '#dc2626' : item.priority === 'Medium' ? '#d97706' : '#2563eb',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                {item.priority}
              </span>
            </td>
            <td style={{ padding: '12px', fontSize: '13px' }}>
              <span style={{
                background: item.status === 'Resolved' ? '#dcfce7' : item.status === 'Escalated' ? '#fecaca' : '#dbeafe',
                color: item.status === 'Resolved' ? '#16a34a' : item.status === 'Escalated' ? '#dc2626' : '#2563eb',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                {item.status}
              </span>
            </td>
            <td style={{ padding: '12px' }}>
              <button onClick={() => onViewDetails?.(item)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', marginRight: '8px' }}>View</button>
              <button onClick={() => onRespond?.(item)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px' }}>Respond</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const DashboardHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: '24px' }}>
    <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{title}</h1>
    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{subtitle}</p>
  </div>
)
