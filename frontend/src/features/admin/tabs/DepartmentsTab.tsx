import { useEffect, useState } from 'react'
import apiClient from '../../../api/client'
import toast from 'react-hot-toast'

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiClient.get('/departments/').then(r => setDepartments(r.data.results || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/departments/', form)
      toast.success('Department created!')
      setShowForm(false)
      setForm({ name: '' })
      load()
    } catch { toast.error('Failed to create department') }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
          + Add Department
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Department name</label>
              <input value={form.name} onChange={e => setForm({ name: e.target.value })} required placeholder="e.g. Engineering"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600, height: 42 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#6b7280', fontSize: 14, height: 42 }}>Cancel</button>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {departments.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', color: '#9ca3af' }}>No departments yet</div>
          ) : departments.map((d: any) => (
            <div key={d.id} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.employee_count} employee{d.employee_count !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
