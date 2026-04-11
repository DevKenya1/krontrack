import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { attendanceApi } from '../../api/attendance'
import { timesheetsApi } from '../../api/timesheets'
import { leaveApi } from '../../api/leave'
import { formatHours, elapsedTime, formatTime } from '../../utils/dateUtils'
import type { Timesheet, PTOAccrual } from '../../types'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { employee } = useAuthStore()
  const { status, fetchStatus, clockIn, clockOut, startBreak, endBreak } = useAttendanceStore()
  const [todaySummary, setTodaySummary] = useState<any>(null)
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([])
  const [ptoBalances, setPtoBalances] = useState<PTOAccrual[]>([])
  const [elapsed, setElapsed] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
    attendanceApi.getTodaySummary().then(setTodaySummary).catch(() => {})
    leaveApi.getMyBalances().then(setPtoBalances).catch(() => {})
    if (employee?.is_manager) {
      timesheetsApi.getPendingApprovals().then(setPendingTimesheets).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!status?.clocked_in || !status.entry) return
    const tick = setInterval(() => setElapsed(elapsedTime(status.entry!.clock_in)), 1000)
    setElapsed(elapsedTime(status.entry.clock_in))
    return () => clearInterval(tick)
  }, [status])

  const handleClockIn = async () => {
    setLoading(true)
    try {
      await clockIn({ method: 'web' })
      toast.success('Clocked in successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to clock in')
    }
    setLoading(false)
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      await clockOut({ method: 'web' })
      toast.success('Clocked out successfully!')
      attendanceApi.getTodaySummary().then(setTodaySummary)
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to clock out')
    }
    setLoading(false)
  }

  const handleBreak = async () => {
    setLoading(true)
    try {
      if (status?.on_break) {
        await endBreak()
        toast.success('Break ended')
      } else {
        await startBreak('rest')
        toast.success('Break started')
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Error')
    }
    setLoading(false)
  }

  const isClockedIn = status?.clocked_in
  const onBreak = status?.on_break

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>
          Good {getGreeting()}, {employee?.full_name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
          Here's your work summary for today
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        <MetricCard
          label="Regular hours today"
          value={formatHours(todaySummary?.total_regular_hours || 0)}
          gradient="linear-gradient(135deg,#3b82f6,#6366f1)"
          icon="⏱"
        />
        <MetricCard
          label="Overtime today"
          value={formatHours(todaySummary?.total_overtime_hours || 0)}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)"
          icon="⚡"
        />
        <MetricCard
          label="Vacation balance"
          value={formatHours(ptoBalances.find(b => b.leave_type === 'vacation')?.balance_hours || 0)}
          gradient="linear-gradient(135deg,#10b981,#059669)"
          icon="🏖"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: 28,
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b', marginBottom: 24 }}>
            Clock In / Out
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <button
              onClick={isClockedIn ? handleClockOut : handleClockIn}
              disabled={loading}
              style={{
                width: 150, height: 150, borderRadius: '50%', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: isClockedIn
                  ? 'linear-gradient(135deg,#10b981,#059669)'
                  : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                boxShadow: isClockedIn
                  ? '0 4px 24px rgba(16,185,129,0.40), 0 0 0 10px rgba(16,185,129,0.10)'
                  : '0 4px 24px rgba(99,102,241,0.40), 0 0 0 10px rgba(99,102,241,0.10)',
                color: '#fff', fontWeight: 700, fontSize: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, transition: 'all 0.3s',
                transform: loading ? 'scale(0.97)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: 28 }}>{isClockedIn ? '⏹' : '▶'}</span>
              <span>{loading ? '...' : isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}</span>
            </button>

            {isClockedIn && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#1e1b4b', fontVariantNumeric: 'tabular-nums' }}>
                  {elapsed}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                  Since {status?.entry ? formatTime(status.entry.clock_in) : ''}
                </div>
              </div>
            )}

            {isClockedIn && (
              <button
                onClick={handleBreak}
                disabled={loading}
                style={{
                  padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: onBreak
                    ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                    : '#f0f4ff',
                  color: onBreak ? '#fff' : '#6366f1',
                  fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                }}
              >
                {onBreak ? '⏸ End Break' : '☕ Start Break'}
              </button>
            )}

            <div style={{ width: '100%', borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
              <StatusRow label="Status" value={
                onBreak ? 'On Break' : isClockedIn ? 'Clocked In' : 'Not Clocked In'
              } color={onBreak ? '#f59e0b' : isClockedIn ? '#10b981' : '#9ca3af'} />
              {status?.entry?.clock_in_method && (
                <StatusRow label="Method" value={status.entry.clock_in_method} color="#6366f1" />
              )}
              {todaySummary?.entries?.length > 0 && (
                <StatusRow label="Entries today" value={todaySummary.entries.length} color="#3b82f6" />
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {employee?.is_manager && pendingTimesheets.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: 20, padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b' }}>
                  Pending Approvals
                </div>
                <div style={{
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff', borderRadius: 99, fontSize: 11, fontWeight: 700,
                  padding: '2px 8px',
                }}>
                  {pendingTimesheets.length}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingTimesheets.slice(0, 4).map(ts => (
                  <div key={ts.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: '#f8faff', border: '1px solid #e5e7eb',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1e1b4b' }}>
                        {ts.employee_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {ts.period_start} → {ts.period_end}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#6366f1' }}>
                        {formatHours(Number(ts.total_hours))}
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px',
                        borderRadius: 99, background: '#fef3c7', color: '#92400e', marginTop: 2,
                      }}>
                        PENDING
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: '#fff', borderRadius: 20, padding: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b', marginBottom: 16 }}>
              PTO Balances
            </div>
            {ptoBalances.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                No PTO balances yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ptoBalances.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1e1b4b', textTransform: 'capitalize' }}>
                        {b.leave_type.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Available balance</div>
                    </div>
                    <div style={{
                      fontSize: 18, fontWeight: 700,
                      background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      {formatHours(Number(b.balance_hours))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: '#fff', borderRadius: 20, padding: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b', marginBottom: 16 }}>
              Today's entries
            </div>
            {!todaySummary?.entries?.length ? (
              <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                No entries yet today
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todaySummary.entries.map((e: any) => (
                  <div key={e.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 10,
                    background: '#f8faff', border: '1px solid #e5e7eb',
                  }}>
                    <div style={{ fontSize: 13, color: '#4b5563' }}>
                      {formatTime(e.clock_in)} → {e.clock_out ? formatTime(e.clock_out) : 'Active'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>
                        {e.duration_hours ? formatHours(e.duration_hours) : '—'}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: e.clock_out ? '#d1fae5' : '#dbeafe',
                        color: e.clock_out ? '#065f46' : '#1e40af',
                      }}>
                        {e.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function MetricCard({ label, value, gradient, icon }: {
  label: string; value: string; gradient: string; icon: string
}) {
  return (
    <div style={{
      borderRadius: 20, padding: '20px 24px', position: 'relative', overflow: 'hidden',
      background: gradient, boxShadow: '0 4px 16px rgba(99,102,241,0.20)',
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{label}</div>
    </div>
  )
}

function StatusRow({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
      <span style={{ fontSize: 12, color: '#9ca3af' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
    </div>
  )
}
