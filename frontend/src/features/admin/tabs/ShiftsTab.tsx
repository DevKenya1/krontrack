import { useEffect, useState } from 'react'
import apiClient from '../../../api/client'
import toast from 'react-hot-toast'

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN']
const DAY_LABELS: Record<string,string> = { MON:'Mon',TUE:'Tue',WED:'Wed',THU:'Thu',FRI:'Fri',SAT:'Sat',SUN:'Sun' }

export default function ShiftsTab() {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', start_time: '09:00', end_time: '17:00', schedule_days: ['MON','TUE','WED','THU','FRI'], grace_period_minutes: 10 })

  const load = () => {
    setLoading(true)
    apiClient.get('/shifts/').then(r => setShifts(r.data.results || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      schedule_days: f.schedule_days.includes(day) ? f.schedule_days.filter(d => d !== day) : [...f.schedule_days, day]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/shifts/', form)
      toast.success('Shift created!')
      setShowForm(false)
      load()
    } catch { toast.error('Failed to create shift') }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
          + Add Shift
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 18px', color: '#1e1b4b', fontSize: 15, fontWeight: 600 }}>New Shift</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Shift name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Morning Shift"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Start time</label>
                <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>End time</label>
                <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Grace period (minutes)</label>
                <input type="number" min={0} max={60} value={form.grace_period_minutes} onChange={e => setForm({...form, grace_period_minutes: Number(e.target.value)})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 8 }}>Working days</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {DAYS.map(d => (
                  <button key={d} type="button" onClick={() => toggleDay(d)} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: form.schedule_days.includes(d) ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : '#f3f4f6',
                    color: form.schedule_days.includes(d) ? '#fff' : '#6b7280',
                  }}>{DAY_LABELS[d]}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                {saving ? 'Saving...' : 'Create Shift'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#6b7280', fontSize: 14 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {shifts.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', color: '#9ca3af' }}>No shifts yet</div>
          ) : shifts.map((s: any) => (
            <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🕐</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#6366f1', marginTop: 1 }}>{s.start_time} — {s.end_time}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DAYS.map(d => (
                  <span key={d} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: (s.schedule_days || []).includes(d) ? '#eef2ff' : '#f9fafb', color: (s.schedule_days || []).includes(d) ? '#6366f1' : '#d1d5db' }}>{DAY_LABELS[d]}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Grace period: {s.grace_period_minutes} minutes</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
