import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuthStore } from '../../store/authStore'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { isAuthenticated, employee, loadProfile } = useAuthStore()
  useWebSocket()

  useEffect(() => {
    if (isAuthenticated && !employee) loadProfile()
  }, [isAuthenticated, employee, loadProfile])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4ff' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{
        marginLeft: collapsed ? 68 : 240,
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
        transition: 'margin-left 0.25s ease',
      }}>
        <Header />
        <main style={{ flex: 1, padding: '28px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
