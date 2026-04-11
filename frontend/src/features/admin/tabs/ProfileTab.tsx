import { useState, useRef } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { employeesApi } from '../../../api/employees'
import toast from 'react-hot-toast'
import apiClient from '../../../api/client'

export default function ProfileTab() {
  const { employee, loadProfile } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [form, setForm] = useState({
    phone: employee?.phone || '',
    timezone: employee?.timezone || 'UTC',
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !employee) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await employeesApi.updateAvatar(employee.id, formData)
      await loadProfile()
      toast.success('Profile photo updated!')
    } catch { toast.error('Failed to upload photo') }
    setUploading(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return
    setSaving(true)
    try {
      await employeesApi.update(employee.id, form)
      await loadProfile()
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      await apiClient.post('/auth/change-password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      })
      toast.success('Password changed successfully!')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to change password')
    }
    setSaving(false)
  }

  const initials = employee?.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || ''

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b', margin: '0 0 24px' }}>Profile Photo & Info</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', overflow: 'hidden', border: '3px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {employee?.avatar
                ? <img src={employee.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                : <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{initials}</span>
              }
            </div>
            <button onClick={() => fileRef.current?.click()} style={{
              position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: '2px solid #fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: '#fff', padding: 0,
            }}>
              {uploading ? '⟳' : '✎'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b' }}>{employee?.full_name}</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{employee?.email}</div>
            <div style={{ fontSize: 12, color: '#6366f1', marginTop: 4, textTransform: 'capitalize' }}>{employee?.role} · {employee?.employee_id}</div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Phone number</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Timezone</label>
              <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' }}>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Africa/Nairobi">Nairobi (EAT)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 600,
              boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
            }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e1b4b', margin: '0 0 24px' }}>Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'old_password', label: 'Current password' },
              { key: 'new_password', label: 'New password' },
              { key: 'confirm', label: 'Confirm new password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type="password" value={(pwForm as any)[f.key]}
                  onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                  required minLength={f.key === 'old_password' ? 1 : 8}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8faff', border: '1px solid #e0e7ff', fontSize: 12, color: '#6b7280' }}>
              Password must be at least 8 characters. Use a mix of letters, numbers, and symbols.
            </div>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 14, fontWeight: 600,
              boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
            }}>{saving ? 'Updating...' : 'Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
