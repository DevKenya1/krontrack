import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { employeesApi } from '../../api/employees'

const roleLabel: Record<string, string> = {
  admin: 'System Administrator',
  manager: 'Manager',
  hr: 'HR Officer',
  employee: 'Employee',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Header() {
  const { employee, logout, loadProfile } = useAuthStore()
  const { unreadCount, fetchUnreadCount } = useNotificationStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUnreadCount()
    const poll = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(poll)
  }, [fetchUnreadCount])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !employee) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await employeesApi.updateAvatar(employee.id, formData)
      await loadProfile()
    } catch {
      alert('Failed to upload image. Please try again.')
    }
    setUploading(false)
  }

  const initials = employee?.full_name
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || ''

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 68,
      background: 'rgba(240,244,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 15, color: '#6b7280', fontWeight: 400 }}>
            {getGreeting()},
          </span>
          <span style={{
            fontSize: 20, fontWeight: 700,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {employee?.full_name || ''}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
          {roleLabel[employee?.role || ''] || ''}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#f0f4ff', border: '1px solid #e0e7ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🔔
          </div>
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              background: 'linear-gradient(135deg,#ef4444,#dc2626)',
              color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700,
              minWidth: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
            }}>
              {unreadCount}
            </div>
          )}
        </div>

        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              border: '2.5px solid #e0e7ff',
              overflow: 'hidden', cursor: 'pointer', padding: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: dropdownOpen ? '0 0 0 3px rgba(99,102,241,0.25)' : 'none',
              transition: 'all 0.15s', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {employee?.avatar ? (
              <img
                src={employee.avatar}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{initials}</span>
            )}
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 50,
              background: '#fff', borderRadius: 16,
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
              width: 240, zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg,#f0f4ff,#f5f3ff)',
                borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      overflow: 'hidden', border: '2px solid #e0e7ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {employee?.avatar ? (
                        <img src={employee.avatar} alt="avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{initials}</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      title="Change photo"
                      style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#6366f1', border: '2px solid #fff',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#fff', padding: 0,
                      }}
                    >
                      {uploading ? '⟳' : '✎'}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e1b4b',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {employee?.full_name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                      {roleLabel[employee?.role || '']}
                    </div>
                    {employee?.department_name && (
                      <div style={{ fontSize: 11, color: '#6366f1', marginTop: 1 }}>
                        {employee.department_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: '6px' }}>
                <DropItem
                  icon="⚙"
                  label="Settings"
                  sub="Profile, password & preferences"
                  onClick={() => { navigate('/admin'); setDropdownOpen(false) }}
                />
                <div style={{ borderTop: '1px solid #f3f4f6', margin: '4px 0' }} />
                <DropItem
                  icon="🚪"
                  label="Sign out"
                  sub="End your session"
                  onClick={() => { logout(); setDropdownOpen(false) }}
                  danger
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function DropItem({ icon, label, sub, onClick, danger }: {
  icon: string; label: string; sub: string; onClick: () => void; danger?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 10, border: 'none',
        background: hover ? (danger ? '#fff1f2' : '#f8faff') : 'transparent',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.1s',
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: danger ? '#fee2e2' : '#eef2ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      }}>
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: danger ? '#dc2626' : '#1e1b4b' }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>
      </div>
    </button>
  )
}
