import { useEffect, useState } from 'react'
import { leaveApi } from '../../api/leave'
import type { PTORequest, PTOAccrual } from '../../types'
import { formatDate, formatHours } from '../../utils/dateUtils'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  approved:  { bg: '#d1fae5', color: '#065f46' },
  rejected:  { bg: '#fee2e2', color: '#991b1b' },
  cancelled: { bg: '#f3f4f6', color: '#6b7280' },
}

const leaveTypes = ['vacation', 'sick', 'personal', 'bereavement', 'unpaid', 'other']

export default function LeavePage() {
  const { employee } = useAuthStore()
  const [requests, setRequests] = useState<PTORequest[]>([])
  const [balances, setBalances] = useState<PTOAccrual[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [tab, setTab] = useState<'mine' | 'team'>('mine')
  const [form, setForm] = useState({
    leave_type: 'vacation', start_date: '', end_date: '', reason: '',
    total_days: 1, total_hours: 8,
  })

  const load = async () => {
    setLoading(true)
    try {
      const [reqRes, bal] = await Promise.all([
        leaveApi.getRequests(),
        leaveApi.getMyBalances(),
      ])
      setRequests(reqRes.results)
      setBalances(bal)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await leaveApi.createRequest(form as any)
      toast.success('Leave request submitted!')
      setShowForm(false)
      setForm({ leave_type: 'vacation', start_date: '', end_date: '', reason: '', total_days: 1, total_hours: 8 })
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.non_field_errors?.[0] || 'Failed to submit request')
    }
    setActionLoading(false)
  }

  const handleCancel = async (id: string) => {
    try {
      await leaveApi.cancelRequest(id)
      toast.success('Request cancelled')
      load()
    } catch { toast.error('Failed to cancel') }
  }

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      await leaveApi.reviewRequest(id, action)
      toast.success(`Request ${action}d`)
      load()
    } catch { toast.error('Failed to process') }
  }

  const mine = requests.filter(r => r.employee === employee?.id)
  const team = requests.filter(r => r.employee !== employee?.id)
  const isAdminOrHR = employee?.role === 'admin' || employee?.role === 'hr'
  const list = tab === 'team' ? team : mine

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Leave & PTO</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>Manage time off requests and balances</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          boxShadow: '0 2px 8px rgba(99,102,241,0.30)',
        }}>
          + Request Leave
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {balances.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '24px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', color: '#9ca3af', fontSize: 13 }}>
            No PTO balances set up yet
          </div>
        ) : balances.map(b => (
          <div key={b.id} style={{
            background: '#fff', borderRadius: 16, padding: '20px 22px',
            border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#9ca3af', textTransform: 'capitalize', marginBottom: 4 }}>
                  {b.leave_type.replace('_', ' ')}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {formatHours(Number(b.balance_hours))}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Available balance</div>
              </div>
              <div style={{ fontSize: 28 }}>
                {b.leave_type === 'vacation' ? '🏖' : b.leave_type === 'sick' ? '🤒' : '📅'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e5e7eb', marginBottom: 24, boxShadow: '0 4px 20px rgba(99,102,241,0.10)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b', margin: '0 0 20px' }}>New Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Leave type</label>
                <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', color: '#1e1b4b' }}>
                  {leaveTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Total days</label>
                <input type="number" min={0.5} step={0.5} value={form.total_days}
                  onChange={e => setForm({ ...form, total_days: Number(e.target.value), total_hours: Number(e.target.value) * 8 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Start date</label>
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>End date</label>
                <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Reason (optional)</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3}
                placeholder="Briefly describe your reason..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={actionLoading} style={{
                padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600,
              }}>{actionLoading ? 'Submitting...' : 'Submit Request'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: '10px 24px', borderRadius: 10, border: '1px solid #e5e7eb',
                background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {(employee?.is_manager || isAdminOrHR) && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 12, padding: 4, border: '1px solid #e5e7eb', width: 'fit-content' }}>
          {(['mine', 'team'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 500, fontSize: 13,
              background: tab === t ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
              color: tab === t ? '#fff' : '#6b7280',
            }}>
              {t === 'mine' ? 'My Requests' : `${isAdminOrHR ? 'All' : 'Team'} Requests${team.length ? ` (${team.length})` : ''}`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏖</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b' }}>No leave requests</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>Click "Request Leave" to submit a new request</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(r => (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 16, padding: '18px 24px',
              border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,#eef2ff,#ede9fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {r.leave_type === 'vacation' ? '🏖' : r.leave_type === 'sick' ? '🤒' : '📅'}
                  </div>
                  <div>
                    {tab === 'team' && <div style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', marginBottom: 2 }}>{r.employee_name}</div>}
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', textTransform: 'capitalize' }}>
                      {r.leave_type.replace('_', ' ')} Leave
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {formatDate(r.start_date)} → {formatDate(r.end_date)} · {r.total_days} day{r.total_days !== 1 ? 's' : ''}
                    </div>
                    {r.reason && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontStyle: 'italic' }}>"{r.reason}"</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', ...statusColors[r.status],
                  }}>
                    {r.status}
                  </div>
                  {r.status === 'pending' && r.employee === employee?.id && (
                    <button onClick={() => handleCancel(r.id)} style={{
                      padding: '6px 14px', borderRadius: 8, border: '1px solid #fee2e2',
                      background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}>Cancel</button>
                  )}
                  {r.status === 'pending' && tab === 'team' && (employee?.is_manager || isAdminOrHR) && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleReview(r.id, 'approve')} style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>✓ Approve</button>
                      <button onClick={() => handleReview(r.id, 'reject')} style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>✗ Reject</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
