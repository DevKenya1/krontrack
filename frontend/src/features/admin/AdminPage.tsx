import { useState } from 'react'
import EmployeesTab from './tabs/EmployeesTab'
import SettingsTab from './tabs/SettingsTab'
import DepartmentsTab from './tabs/DepartmentsTab'
import ShiftsTab from './tabs/ShiftsTab'
import OvertimeTab from './tabs/OvertimeTab'
import ProfileTab from './tabs/ProfileTab'

const tabs = [
  { key: 'employees', label: '👥 Employees' },
  { key: 'departments', label: '🏢 Departments' },
  { key: 'shifts', label: '🕐 Shifts' },
  { key: 'overtime', label: '⚡ Overtime Rules' },
  { key: 'profile', label: '👤 My Profile' },
  { key: 'settings', label: '⚙ System Settings' },
]

export default function AdminPage() {
  const [tab, setTab] = useState('employees')

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Admin</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
          Manage employees, departments, shifts and system configuration
        </p>
      </div>

      <div style={{
        display: 'flex', gap: 4, marginBottom: 28,
        background: '#fff', borderRadius: 14, padding: 5,
        border: '1px solid #e5e7eb', flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 500, fontSize: 13, transition: 'all 0.15s', whiteSpace: 'nowrap',
            background: tab === t.key ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
            color: tab === t.key ? '#fff' : '#6b7280',
            boxShadow: tab === t.key ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'employees' && <EmployeesTab />}
      {tab === 'departments' && <DepartmentsTab />}
      {tab === 'shifts' && <ShiftsTab />}
      {tab === 'overtime' && <OvertimeTab />}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  )
}
