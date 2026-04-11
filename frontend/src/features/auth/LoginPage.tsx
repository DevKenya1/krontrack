import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../api/client'

interface SSOProvider {
  id: string
  name: string
  url: string
  color: string
  icon: string
}

const PROVIDER_ICONS: Record<string, string> = {
  google: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  microsoft: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M13 1h10v10H13z"/><path fill="#7fba00" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>`,
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([])
  const [activeTab, setActiveTab] = useState<'credentials' | 'sso'>('credentials')
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    apiClient.get('/auth/sso-providers/')
      .then(r => setSsoProviders(r.data.providers || []))
      .catch(() => {})
    return () => clearError()
  }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
  }

  const hasSso = ssoProviders.length > 0

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 40%, #1e3a5f 100%)',
    }}>


      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 68, height: 68, borderRadius: 22, marginBottom: 18,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.45)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: '-0.75px' }}>
              Krontrack
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 6 }}>
              Time & Attendance Management
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 24, padding: '32px 32px 28px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.30)',
          }}>

            {hasSso && (
              <div style={{ display: 'flex', marginBottom: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4 }}>
                {(['credentials', 'sso'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                    cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                    background: activeTab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: activeTab === t ? '#fff' : 'rgba(255,255,255,0.50)',
                  }}>
                    {t === 'credentials' ? '🔑 Password' : '🔗 SSO Login'}
                  </button>
                ))}
              </div>
            )}

            {(!hasSso || activeTab === 'credentials') && (
              <>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 22px', letterSpacing: '-0.3px' }}>
                  Sign in to your account
                </h2>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                    color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>⚠</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 7, letterSpacing: '0.03em' }}>
                      USERNAME
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>👤</span>
                      <input
                        type="text" value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required autoFocus
                        style={{
                          width: '100%', padding: '11px 14px 11px 40px', borderRadius: 11,
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.70)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 7, letterSpacing: '0.03em' }}>
                      PASSWORD
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>🔒</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        style={{
                          width: '100%', padding: '11px 44px 11px 40px', borderRadius: 11,
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.70)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,0.40)', padding: 0 }}>
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={isLoading}
                    style={{
                      marginTop: 6, padding: '13px', borderRadius: 12, border: 'none',
                      background: isLoading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      color: '#fff', fontSize: 15, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: isLoading ? 'none' : '0 4px 20px rgba(99,102,241,0.40)',
                      transition: 'all 0.2s', letterSpacing: '0.02em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Signing in...
                      </>
                    ) : 'Sign in →'}
                  </button>
                </form>

                {hasSso && (
                  <div style={{ marginTop: 22, textAlign: 'center' }}>
                    <button onClick={() => setActiveTab('sso')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
                      Or use SSO login →
                    </button>
                  </div>
                )}
              </>
            )}

            {hasSso && activeTab === 'sso' && (
              <>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
                  Continue with your organization
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 24px', lineHeight: 1.5 }}>
                  Sign in using your company's HR system credentials
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ssoProviders.map(provider => (
                    <a key={provider.id} href={provider.url} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 18px', borderRadius: 12, textDecoration: 'none',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', fontSize: 14, fontWeight: 500,
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                        dangerouslySetInnerHTML={{ __html: PROVIDER_ICONS[provider.id] || `<span style="font-size:16px;font-weight:700;color:${provider.color}">${provider.icon}</span>` }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>Continue with {provider.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginTop: 1 }}>
                          Use your {provider.name} account
                        </div>
                      </div>
                      <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.30)', fontSize: 18 }}>›</span>
                    </a>
                  ))}
                </div>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button onClick={() => setActiveTab('credentials')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
                    ← Back to password login
                  </button>
                </div>
              </>
            )}
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.20)', fontSize: 12, marginTop: 24 }}>
            Krontrack v1.0 · Secure Time Tracking · {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(30,27,75,0.9) inset;
          -webkit-text-fill-color: #fff;
        }
      `}</style>
    </div>
  )
}
