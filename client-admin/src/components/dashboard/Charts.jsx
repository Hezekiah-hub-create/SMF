import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts'

// Color palette
const COLORS = ['#4169e1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: '#fff', 
        padding: '12px', 
        border: '1px solid #e6e9ee', 
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0 0', color: entry.color, fontSize: '13px' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Bar Chart Component
export const BarChartWidget = ({ data, dataKey, xAxisKey, title, height = 300, colors = COLORS }) => {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Line Chart Component
export const LineChartWidget = ({ data, lines, xAxisKey, title, height = 300 }) => {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line, index) => (
            <Line 
              key={index}
              type="monotone" 
              dataKey={line.dataKey} 
              name={line.name}
              stroke={line.color || COLORS[index]} 
              strokeWidth={2}
              dot={{ fill: line.color || COLORS[index], strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Area Chart Component
export const AreaChartWidget = ({ data, areas, xAxisKey, title, height = 300 }) => {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {areas.map((area, index) => (
              <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color || COLORS[index]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.color || COLORS[index]} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {areas.map((area, index) => (
            <Area 
              key={index}
              type="monotone" 
              dataKey={area.dataKey} 
              name={area.name}
              stroke={area.color || COLORS[index]} 
              fill={`url(#color${index})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Pie Chart Component
export const PieChartWidget = ({ data, nameKey, valueKey, title, height = 300, colors = COLORS }) => {
  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0)
  
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ResponsiveContainer width="50%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey={valueKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, paddingLeft: '20px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '3px', 
                background: colors[index % colors.length],
                marginRight: '8px'
              }} />
              <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{item[nameKey]}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                {total > 0 ? Math.round((item[valueKey] / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Donut Chart Component
export const DonutChartWidget = ({ data, nameKey, valueKey, title, height = 300, colors = COLORS }) => {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey={valueKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Horizontal Bar Chart
export const HorizontalBarChart = ({ data, bars, title, height = 300, colors = COLORS }) => {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar 
              key={index}
              dataKey={bar.dataKey} 
              name={bar.name}
              fill={bar.color || colors[index]} 
              radius={[0, 4, 4, 0]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Stacked Bar Chart
export const StackedBarChart = ({ data, bars, xAxisKey, title, height = 300, colors = COLORS }) => {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar 
              key={index}
              dataKey={bar.dataKey} 
              name={bar.name}
              stackId="a"
              fill={bar.color || colors[index]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Radar Chart
export const RadarChartWidget = ({ data, metrics, title, height = 300, colors = COLORS }) => {
  // Simple radar-like visualization using bar chart
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item, index) => (
          <div key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: '#374151' }}>{item.name}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{item.value}%</span>
            </div>
            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${item.value}%`, 
                height: '100%', 
                background: colors[index % colors.length],
                borderRadius: '4px'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Progress Circle
export const ProgressCircle = ({ percentage, size = 120, strokeWidth = 10, color = '#4169e1', title }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee', textAlign: 'center' }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>}
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size}>
          <circle
            stroke="#f3f4f6"
            fill="none"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          {percentage}%
        </div>
      </div>
    </div>
  )
}

export default {
  BarChartWidget,
  LineChartWidget,
  AreaChartWidget,
  PieChartWidget,
  DonutChartWidget,
  HorizontalBarChart,
  StackedBarChart,
  RadarChartWidget,
  ProgressCircle
}
