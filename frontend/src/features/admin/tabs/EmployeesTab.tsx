import { useEffect, useState } from 'react'
import { employeesApi } from '../../../api/employees'
import type { Employee } from '../../../types'
import { formatDate } from '../../../utils/dateUtils'

const roleColors: Record<string, { bg: string; color: string }> = {
  admin:    { bg: '#ede9fe', color: '#5b21b6' },
  manager:  { bg: '#dbeafe', color: '#1e40af' },
  hr:       { bg: '#fef3c7', color: '#92400e' },
  employee: { bg: '#d1fae5', color: '#065f46' },
}

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    employeesApi.getAll(search ? { search } : undefined)
      .then(r => setEmployees(r.results))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div>
      <input
        type="text" placeholder="🔍  Search by name, ID or email..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 380, padding: '10px 16px', borderRadius: 12,
          border: '1px solid #e5e7eb', fontSize: 14, outline: 'none',
          background: '#fff', color: '#1e1b4b', boxSizing: 'border-box', marginBottom: 20,
        }}
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
          <div style={{ padding: '12px 24px', background: '#f8faff', borderBottom: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px', gap: 12 }}>
            {['Employee', 'Department', 'Role', 'Type', 'Hired', 'Status'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>
          {employees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No employees found</div>
          ) : employees.map(emp => (
            <div key={emp.id} style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px', gap: 12, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 12, overflow: 'hidden' }}>
                  {emp.avatar ? <img src={emp.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e1b4b' }}>{emp.full_name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{emp.employee_id}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#4b5563', alignSelf: 'center' }}>{emp.department_name || '—'}</div>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', ...roleColors[emp.role] }}>{emp.role}</span>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center', textTransform: 'capitalize' }}>{emp.employment_type.replace('_', ' ')}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', alignSelf: 'center' }}>{emp.date_hired ? formatDate(emp.date_hired) : '—'}</div>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: emp.is_active ? '#d1fae5' : '#fee2e2', color: emp.is_active ? '#065f46' : '#991b1b' }}>
                  {emp.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
