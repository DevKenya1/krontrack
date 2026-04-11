import { useEffect, useState } from 'react'
import { attendanceApi } from '../../api/attendance'
import type { TimeEntry } from '../../types'
import { formatDate, formatTime, formatHours, minutesToHours } from '../../utils/dateUtils'

const statusColors: Record<string, { bg: string; color: string }> = {
  active:        { bg: '#dbeafe', color: '#1e40af' },
  completed:     { bg: '#d1fae5', color: '#065f46' },
  missed_out:    { bg: '#fee2e2', color: '#991b1b' },
  edited:        { bg: '#fef3c7', color: '#92400e' },
  pending_review:{ bg: '#ede9fe', color: '#5b21b6' },
}

const methodIcons: Record<string, string> = {
  web: '🌐', mobile: '📱', pin: '🔢', qr: '📷', manager: '👤', api: '⚡'
}

export default function AttendancePage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TimeEntry | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const res = await attendanceApi.getEntries({ page: String(p) })
      setEntries(res.results)
      setTotal(res.count)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(page) }, [page])

  const totalPages = Math.ceil(total / 25)

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Attendance</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
          View all clock-in and clock-out records
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total entries', value: total, icon: '📊', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
          { label: 'This page', value: entries.length, icon: '📋', grad: 'linear-gradient(135deg,#10b981,#059669)' },
          { label: 'Completed', value: entries.filter(e => e.status === 'completed').length, icon: '✅', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
        ].map(c => (
          <div key={c.label} style={{
            borderRadius: 16, padding: '18px 22px',
            background: c.grad, boxShadow: '0 4px 16px rgba(99,102,241,0.15)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading entries...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏱</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b' }}>No attendance records</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>Clock in from the dashboard to start tracking</div>
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <div style={{ padding: '14px 24px', background: '#f8faff', borderBottom: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 80px', gap: 12 }}>
              {['Date', 'Clock In', 'Clock Out', 'Duration', 'Method', 'Status'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {entries.map(entry => (
              <div key={entry.id}>
                <div
                  onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                  style={{
                    padding: '14px 24px', display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 80px',
                    gap: 12, cursor: 'pointer', transition: 'background 0.1s',
                    borderBottom: '1px solid #f3f4f6',
                    background: selected?.id === entry.id ? '#f8faff' : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e1b4b' }}>
                    {formatDate(entry.clock_in)}
                  </div>
                  <div style={{ fontSize: 13, color: '#4b5563' }}>{formatTime(entry.clock_in)}</div>
                  <div style={{ fontSize: 13, color: '#4b5563' }}>
                    {entry.clock_out ? formatTime(entry.clock_out) : <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>
                    {entry.duration_hours ? formatHours(entry.duration_hours) : '—'}
                  </div>
                  <div style={{ fontSize: 13, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{methodIcons[entry.clock_in_method] || '🌐'}</span>
                    <span style={{ textTransform: 'capitalize' }}>{entry.clock_in_method}</span>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em', width: 'fit-content',
                    ...statusColors[entry.status],
                  }}>
                    {entry.status.replace('_', ' ')}
                  </div>
                </div>
                {selected?.id === entry.id && (
                  <div style={{ padding: '16px 24px', background: '#f8faff', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
                      {[
                        { label: 'Regular hours', value: formatHours(Number(entry.regular_hours)), color: '#6366f1' },
                        { label: 'Overtime hours', value: formatHours(Number(entry.overtime_hours)), color: '#f59e0b' },
                        { label: 'Break time', value: minutesToHours(entry.total_break_minutes), color: '#10b981' },
                        { label: 'Breaks taken', value: entry.breaks.length, color: '#3b82f6' },
                      ].map(m => (
                        <div key={m.label} style={{ padding: '10px 14px', borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    {entry.breaks.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Breaks</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {entry.breaks.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', fontSize: 13 }}>
                              <span style={{ color: '#4b5563', textTransform: 'capitalize' }}>{b.break_type} break</span>
                              <span style={{ color: '#6366f1', fontWeight: 600 }}>
                                {formatTime(b.start_time)} → {b.end_time ? formatTime(b.end_time) : 'Active'}
                                {b.duration_minutes ? ` (${b.duration_minutes}m)` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
                background: page === 1 ? '#f9fafb' : '#fff', cursor: page === 1 ? 'default' : 'pointer',
                fontSize: 13, color: page === 1 ? '#d1d5db' : '#374151',
              }}>← Prev</button>
              <span style={{ padding: '8px 16px', fontSize: 13, color: '#6b7280' }}>
                Page {page} of {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
                background: page === totalPages ? '#f9fafb' : '#fff', cursor: page === totalPages ? 'default' : 'pointer',
                fontSize: 13, color: page === totalPages ? '#d1d5db' : '#374151',
              }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
