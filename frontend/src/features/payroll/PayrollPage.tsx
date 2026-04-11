import { useEffect, useState } from 'react'
import apiClient from '../../api/client'
import type { PayrollReport } from '../../types'
import { formatDate, formatHours } from '../../utils/dateUtils'
import toast from 'react-hot-toast'

export default function PayrollPage() {
  const [reports, setReports] = useState<PayrollReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({ name: '', period_start: '', period_end: '', format: 'csv' })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/payroll-reports/')
      setReports(data.results || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      await apiClient.post('/payroll-reports/generate/', form)
      toast.success('Report generation started!')
      setShowForm(false)
      setForm({ name: '', period_start: '', period_end: '', format: 'csv' })
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to generate report')
    }
    setGenerating(false)
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    generating: { bg: '#dbeafe', color: '#1e40af' },
    ready:      { bg: '#d1fae5', color: '#065f46' },
    failed:     { bg: '#fee2e2', color: '#991b1b' },
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Payroll Reports</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>Generate and download payroll summaries</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          boxShadow: '0 2px 8px rgba(99,102,241,0.30)',
        }}>
          + Generate Report
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e5e7eb', marginBottom: 24, boxShadow: '0 4px 20px rgba(99,102,241,0.10)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b', margin: '0 0 20px' }}>Generate Payroll Report</h3>
          <form onSubmit={handleGenerate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Report name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  placeholder="e.g. April 2026 Payroll"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Period start</label>
                <input type="date" value={form.period_start} onChange={e => setForm({ ...form, period_start: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Period end</label>
                <input type="date" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Format</label>
                <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' }}>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={generating} style={{
                padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600,
              }}>{generating ? 'Generating...' : 'Generate'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: '10px 24px', borderRadius: 10, border: '1px solid #e5e7eb',
                background: '#fff', color: '#6b7280', fontSize: 14, cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b' }}>No payroll reports yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>Generate your first report using the button above</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map(r => (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 16, padding: '20px 24px',
              border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,#eef2ff,#ede9fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>📊</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {formatDate(r.period_start)} → {formatDate(r.period_end)} · By {r.generated_by_name}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>{r.total_employees} employees</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{formatHours(Number(r.total_regular_hours))} regular</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                      ${Number(r.total_gross_pay).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Gross pay</div>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', ...statusColors[r.status],
                  }}>
                    {r.status}
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: '#f3f4f6', color: '#6b7280', textTransform: 'uppercase',
                  }}>
                    {r.format}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
