import { useState } from 'react'

import connectWithStravaButton from '../assets/btn-strava-connect-with-orange.svg'
import { useAuth } from '../lib/auth-context'

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]']

/**
 * Reusable login card with OAuth login and, on localhost only, manual refresh token login.
 * Used by the root App shell and the /login route.
 */
export function LoginCard() {
  const showRefreshTokenLogin = LOCAL_HOSTNAMES.includes(window.location.hostname)
  const { isAuthenticated, login, user, loginWithRefreshToken } = useAuth()
  const [refreshToken, setRefreshToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && user) {
    return (
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name || 'Profile'} style={styles.avatarImg} />
          ) : (
            <span style={styles.avatarFallback}>{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</span>
          )}
        </div>
        <h2 style={styles.welcome}>Willkommen{user.name ? `, ${user.name}` : ''}!</h2>
        <p style={styles.subtitle}>Du bist erfolgreich angemeldet.</p>
        <a href="/" style={styles.link}>
          → Zur Route-Übersicht
        </a>
      </div>
    )
  }

  async function handleRefreshTokenSubmit(event: React.FormEvent) {
    event.preventDefault()
    const token = refreshToken.trim()
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      await loginWithRefreshToken(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen')
      setLoading(false)
    }
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>GPX-Toolcat</h1>
      <p style={styles.description}>
        Plane, speichere und bewerte deine Routen. Verbinde dich mit Strava, um deine Aktivitäten zu importieren.
      </p>
      <button onClick={login} style={styles.loginButton}>
        <img
          src={connectWithStravaButton}
          alt="Connect with Strava"
          width={237}
          height={48}
          style={styles.loginImage}
        />
      </button>

      {showRefreshTokenLogin && (
        <>
          <div style={styles.dividerText}>
            <span style={styles.dividerLine} />
            <span>oder</span>
            <span style={styles.dividerLine} />
          </div>

          <form onSubmit={handleRefreshTokenSubmit}>
            <input
              type="text"
              placeholder="Refresh Token eingeben"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              style={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !refreshToken}
              style={{
                ...styles.submitTokenButton,
                opacity: loading || !refreshToken ? 0.5 : 1,
              }}
            >
              {loading ? 'Anmeldung...' : 'Mit Token einloggen'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        </>
      )}

      <p style={styles.noteOAuth}>
        Nach dem Login wirst du zu Strava weitergeleitet. Deine Daten werden nur lokal gespeichert.
      </p>

      {showRefreshTokenLogin && (
        <p style={styles.noteToken}>
          Du kannst auch deinen Strava Refresh Token manuell eingeben (
          <a
            href="https://www.strava.com/settings/account"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#3b82f6' }}
          >
            Strava Einstellungen → Meine Anwendungen → API
          </a>
          ).
        </p>
      )}
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '3rem 2.5rem',
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  } as const,
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 0.5rem',
  } as const,
  description: {
    fontSize: 14,
    color: '#64748b',
    margin: '0 0 2rem',
    lineHeight: 1.6,
  } as const,
  // official "Connect with Strava" asset, Strava's brand guidelines require it unmodified
  loginButton: {
    display: 'inline-block',
    padding: 0,
    background: 'none',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    lineHeight: 0,
  } as const,
  loginImage: {
    display: 'block',
  } as const,
  dividerText: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '1.5rem 0',
    color: '#94a3b8',
    fontSize: 13,
  } as const,
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  } as const,
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    outline: 'none',
    marginBottom: 8,
    boxSizing: 'border-box',
  } as const,
  submitTokenButton: {
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    opacity: 0.5,
  } as const,
  error: {
    color: '#ef4444',
    fontSize: 13,
    margin: '0.75rem 0 0',
  } as const,
  noteOAuth: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '1.5rem 0 0',
  } as const,
  noteToken: {
    fontSize: 11,
    color: '#94a3b8',
    margin: '1rem 0 0',
    lineHeight: 1.5,
  } as const,
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    overflow: 'hidden',
    margin: '0 auto 1.5rem',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as const,
  avatarFallback: {
    fontSize: 32,
    fontWeight: 700,
    color: '#64748b',
  } as const,
  welcome: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 0.5rem',
  } as const,
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '0 0 1.5rem',
  } as const,
  link: {
    fontSize: 14,
    fontWeight: 600,
    color: '#3b82f6',
    textDecoration: 'none',
  } as const,
}
