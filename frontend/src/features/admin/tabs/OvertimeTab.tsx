import { useEffect, useState } from 'react'
import apiClient from '../../../api/client'
import toast from 'react-hot-toast'

export default function OvertimeTab() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', daily_threshold_hours: 8, weekly_threshold_hours: 40,
    overtime_multiplier: 1.5, effective_from: new Date().toISOString().split('T')[0],
  })

  const load = () => {
    setLoading(true)
    apiClient.get('/overtime-rules/').then(r => setRules(r.data.results || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/overtime-rules/', form)
      toast.success('Overtime rule created!')
      setShowForm(false)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to create rule')
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#fef3c7,#fffbeb)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div style={{ fontSize: 13, color: '#92400e' }}>
          Overtime rules are applied globally unless a department is specified. Rules are calculated daily and weekly.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
          + Add Rule
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 18px', color: '#1e1b4b', fontSize: 15, fontWeight: 600 }}>New Overtime Rule</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Rule name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Standard OT Rule"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {[
                { key: 'daily_threshold_hours', label: 'Daily threshold (hours)', step: '0.5' },
                { key: 'weekly_threshold_hours', label: 'Weekly threshold (hours)', step: '0.5' },
                { key: 'overtime_multiplier', label: 'OT multiplier (e.g. 1.5)', step: '0.1' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type="number" step={f.step} min={0} value={(form as any)[f.key]}
                    onChange={e => setForm({...form, [f.key]: Number(e.target.value)})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Effective from</label>
                <input type="date" value={form.effective_from} onChange={e => setForm({...form, effective_from: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                {saving ? 'Saving...' : 'Create Rule'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#6b7280', fontSize: 14 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', color: '#9ca3af' }}>No overtime rules yet. Using system defaults (8h/day, 40h/week, 1.5x)</div>
          ) : rules.map((r: any) => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#fef3c7,#fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.department_name || 'Global'} · Effective {r.effective_from}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Daily', value: `>${r.daily_threshold_hours}h` },
                  { label: 'Weekly', value: `>${r.weekly_threshold_hours}h` },
                  { label: 'Multiplier', value: `${r.overtime_multiplier}x` },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
