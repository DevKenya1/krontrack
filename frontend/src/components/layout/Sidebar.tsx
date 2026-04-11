import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/attendance', label: 'Attendance', icon: '⏱' },
  { path: '/timesheets', label: 'Timesheets', icon: '📋' },
  { path: '/leave', label: 'Leave & PTO', icon: '🏖' },
  { path: '/payroll', label: 'Payroll', icon: '💰', roles: ['admin', 'hr', 'manager'] },
  { path: '/admin', label: 'Admin', icon: '⚙', roles: ['admin'] },
]

interface Props {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

export default function Sidebar({ collapsed, setCollapsed }: Props) {
  const { employee } = useAuthStore()

  const visible = navItems.filter(
    (item) => !item.roles || (employee && item.roles.includes(employee.role))
  )

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, height: '100vh',
      width: collapsed ? 68 : 240,
      background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
      transition: 'width 0.25s ease', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '22px 0' : '22px 16px 22px 20px',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              Krontrack
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 1 }}>
              Time & Attendance
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{
            background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.75)', fontSize: 14, flexShrink: 0,
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav style={{
        flex: 1, padding: collapsed ? '4px 8px' : '4px 12px',
        display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto',
      }}>
        {visible.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '11px 0' : '10px 14px',
              borderRadius: 10, fontSize: 14, fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.15s',
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.60)',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'none',
            })}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
