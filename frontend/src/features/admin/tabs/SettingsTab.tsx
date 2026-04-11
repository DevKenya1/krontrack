export default function SettingsTab() {

  const settings = [
    {
      section: 'Time & Attendance',
      icon: '⏱',
      items: [
        { label: 'Missed punch alert threshold', desc: 'Alert after this many hours without clock-out', value: '1 hour' },
        { label: 'Geofence radius', desc: 'Max distance from office for valid clock-in', value: '200 meters' },
        { label: 'Default break duration', desc: 'Suggested break length', value: '30 minutes' },
      ]
    },
    {
      section: 'Payroll',
      icon: '💰',
      items: [
        { label: 'Payroll lock day', desc: 'Day of month when timesheets auto-lock', value: '5th of month' },
        { label: 'Default work hours/day', desc: 'Standard hours before overtime kicks in', value: '8 hours' },
        { label: 'Default work hours/week', desc: 'Weekly threshold for overtime', value: '40 hours' },
      ]
    },
    {
      section: 'Notifications',
      icon: '🔔',
      items: [
        { label: 'Timesheet reminder', desc: 'Send weekly reminder to submit timesheets', value: 'Every Friday 8am' },
        { label: 'Shift reminder', desc: 'Notify employees before their shift starts', value: 'Daily 7am' },
        { label: 'PTO accrual run', desc: 'When PTO balances are calculated', value: 'Every Monday midnight' },
      ]
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <div style={{ fontSize: 13, color: '#4338ca' }}>
          These settings are configured in <code style={{ background: '#e0e7ff', padding: '1px 6px', borderRadius: 4 }}>backend/.env</code> and <code style={{ background: '#e0e7ff', padding: '1px 6px', borderRadius: 4 }}>KRONTRACK_SETTINGS</code>. Edit the .env file to change them.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {settings.map(section => (
          <div key={section.section} style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' }}>
            <div style={{ padding: '16px 24px', background: '#f8faff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{section.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>{section.section}</span>
            </div>
            {section.items.map((item, i) => (
              <div key={i} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < section.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1e1b4b' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{item.desc}</div>
                </div>
                <div style={{ padding: '6px 14px', borderRadius: 99, background: '#f0f4ff', border: '1px solid #e0e7ff', fontSize: 12, fontWeight: 600, color: '#6366f1', whiteSpace: 'nowrap' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: '20px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', marginBottom: 8 }}>System Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Backend', value: 'Django 5 + DRF' },
            { label: 'Database', value: 'PostgreSQL 16' },
            { label: 'Cache', value: 'Redis 7' },
            { label: 'Task Queue', value: 'Celery + Beat' },
            { label: 'Frontend', value: 'React + Vite' },
            { label: 'Version', value: 'Krontrack v1.0' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 14px', borderRadius: 10, background: '#f8faff', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
