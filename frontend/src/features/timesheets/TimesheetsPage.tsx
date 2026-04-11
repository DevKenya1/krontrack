import { useEffect, useState } from 'react'
import { timesheetsApi } from '../../api/timesheets'
import { useAuthStore } from '../../store/authStore'
import type { Timesheet } from '../../types'
import { formatDate, formatHours } from '../../utils/dateUtils'
import toast from 'react-hot-toast'

const statusColors: Record<string, { bg: string; color: string }> = {
  draft:     { bg: '#f3f4f6', color: '#6b7280' },
  submitted: { bg: '#fef3c7', color: '#92400e' },
  approved:  { bg: '#d1fae5', color: '#065f46' },
  rejected:  { bg: '#fee2e2', color: '#991b1b' },
  locked:    { bg: '#ede9fe', color: '#5b21b6' },
}

export default function TimesheetsPage() {
  const { employee } = useAuthStore()
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Timesheet | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [tab, setTab] = useState<'mine' | 'pending'>('mine')
  const [pending, setPending] = useState<Timesheet[]>([])
  const [notesInput, setNotesInput] = useState('')
  const [showNotesFor, setShowNotesFor] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await timesheetsApi.getAll()
      setTimesheets(res.results)
      if (employee?.is_manager) {
        const p = await timesheetsApi.getPendingApprovals()
        setPending(Array.isArray(p) ? p : (p as any).results || [])
      }
    } catch { toast.error('Failed to load timesheets') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (id: string) => {
    setActionLoading(true)
    try {
      await timesheetsApi.submit(id)
      toast.success('Timesheet submitted for approval')
      load()
    } catch (e: any) { toast.error(e?.response?.data?.error || 'Failed to submit') }
    setActionLoading(false)
  }

  const handleApprove = async (id: string) => {
    setActionLoading(true)
    try {
      await timesheetsApi.approve(id, notesInput)
      toast.success('Timesheet approved')
      setShowNotesFor(null); setNotesInput('')
      load()
    } catch (e: any) { toast.error(e?.response?.data?.error || 'Failed to approve') }
    setActionLoading(false)
  }

  const handleReject = async (id: string) => {
    setActionLoading(true)
    try {
      await timesheetsApi.reject(id, notesInput)
      toast.success('Timesheet rejected')
      setShowNotesFor(null); setNotesInput('')
      load()
    } catch (e: any) { toast.error(e?.response?.data?.error || 'Failed to reject') }
    setActionLoading(false)
  }

  const list = tab === 'pending' ? pending : timesheets

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Timesheets</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
            Track and manage your pay period records
          </p>
        </div>
      </div>

      {(employee?.is_manager || employee?.role === 'admin' || employee?.role === 'hr') && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff',
          borderRadius: 12, padding: 4, border: '1px solid #e5e7eb', width: 'fit-content' }}>
          {(['mine', 'pending'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 500, fontSize: 13, transition: 'all 0.15s',
              background: tab === t ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
              color: tab === t ? '#fff' : '#6b7280',
            }}>
              {t === 'mine' ? 'My Timesheets' : `Pending Approvals${pending.length ? ` (${pending.length})` : ''}`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading timesheets...</div>
      ) : list.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60, background: '#fff',
          borderRadius: 20, border: '1px solid #e5e7eb',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b' }}>No timesheets found</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>
            {tab === 'pending' ? 'No timesheets awaiting your approval' : 'Your timesheets will appear here'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(ts => (
            <div key={ts.id} style={{
              background: '#fff', borderRadius: 16, padding: '20px 24px',
              border: '1px solid #e5e7eb',
              boxShadow: selected?.id === ts.id ? '0 0 0 2px #6366f1' : '0 2px 8px rgba(99,102,241,0.06)',
              cursor: 'pointer', transition: 'all 0.15s',
            }} onClick={() => setSelected(selected?.id === ts.id ? null : ts)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,#eef2ff,#ede9fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>📅</div>
                  <div>
                    {tab === 'pending' && (
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', marginBottom: 2 }}>
                        {ts.employee_name}
                      </div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>
                      {formatDate(ts.period_start)} → {formatDate(ts.period_end)}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {ts.department_name || 'No department'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b' }}>
                      {formatHours(Number(ts.total_hours || 0))}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Total hours</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>
                      {formatHours(Number(ts.total_overtime_hours || 0))}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Overtime</div>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    ...statusColors[ts.status],
                  }}>
                    {ts.status}
                  </div>
                </div>
              </div>

              {selected?.id === ts.id && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'Regular hours', value: formatHours(Number(ts.total_regular_hours || 0)), color: '#6366f1' },
                      { label: 'Overtime hours', value: formatHours(Number(ts.total_overtime_hours || 0)), color: '#f59e0b' },
                      { label: 'PTO hours', value: formatHours(Number(ts.total_pto_hours || 0)), color: '#10b981' },
                      { label: 'Break time', value: `${ts.total_break_minutes || 0}m`, color: '#3b82f6' },
                    ].map(m => (
                      <div key={m.label} style={{
                        padding: '12px 16px', borderRadius: 10,
                        background: '#f8faff', border: '1px solid #e5e7eb',
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {ts.approvals && ts.approvals.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Approval history
                      </div>
                      {ts.approvals.map(a => (
                        <div key={a.id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 8,
                          background: a.action === 'approve' ? '#f0fdf4' : '#fff1f2',
                          marginBottom: 4,
                        }}>
                          <span style={{ fontSize: 12, color: '#4b5563' }}>
                            {a.approver_name} · {a.action}
                          </span>
                          {a.notes && <span style={{ fontSize: 12, color: '#9ca3af' }}>{a.notes}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {showNotesFor?.id === ts.id && (
                    <div style={{ marginBottom: 12 }}>
                      <textarea
                        value={notesInput}
                        onChange={e => setNotesInput(e.target.value)}
                        placeholder="Add notes (optional)..."
                        rows={2}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 10,
                          border: '1px solid #e5e7eb', fontSize: 13,
                          color: '#1e1b4b', resize: 'none', outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }} onClick={e => e.stopPropagation()}>
                    {ts.status === 'draft' && ts.is_editable && (
                      <button onClick={() => handleSubmit(ts.id)} disabled={actionLoading} style={{
                        padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                        color: '#fff', fontSize: 13, fontWeight: 600,
                      }}>
                        Submit for Approval
                      </button>
                    )}
                    {tab === 'pending' && ts.status === 'submitted' && (employee?.is_manager || employee?.role === 'admin' || employee?.role === 'hr') && (
                      <>
                        {showNotesFor?.id === ts.id && showNotesFor.action === 'approve' ? (
                          <button onClick={() => handleApprove(ts.id)} disabled={actionLoading} style={{
                            padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            color: '#fff', fontSize: 13, fontWeight: 600,
                          }}>Confirm Approve</button>
                        ) : (
                          <button onClick={() => setShowNotesFor({ id: ts.id, action: 'approve' })} style={{
                            padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            color: '#fff', fontSize: 13, fontWeight: 600,
                          }}>✓ Approve</button>
                        )}
                        {showNotesFor?.id === ts.id && showNotesFor.action === 'reject' ? (
                          <button onClick={() => handleReject(ts.id)} disabled={actionLoading} style={{
                            padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                            color: '#fff', fontSize: 13, fontWeight: 600,
                          }}>Confirm Reject</button>
                        ) : (
                          <button onClick={() => setShowNotesFor({ id: ts.id, action: 'reject' })} style={{
                            padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                            color: '#fff', fontSize: 13, fontWeight: 600,
                          }}>✗ Reject</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
