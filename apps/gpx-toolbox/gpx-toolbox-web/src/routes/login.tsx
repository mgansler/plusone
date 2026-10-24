import { createFileRoute } from '@tanstack/react-router'

import { useAuth } from '../lib/auth-context'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { isAuthenticated, login, user } = useAuth()

  // If already authenticated, show user info
  if (isAuthenticated && user) {
    return (
      <div style={styles.container}>
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
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>GPX-Toolbox</h1>
        <p style={styles.description}>
          Plane, speichere und bewerte deine Routen. Verbinde dich mit Strava, um deine Aktivitäten zu importieren.
        </p>
        <button onClick={login} style={styles.loginButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={styles.loginIcon}>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          Login mit Strava
        </button>
        <p style={styles.note}>
          Nach dem Login wirst du zu Strava weitergeleitet. Deine Daten werden nur lokal gespeichert.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  } as const,
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
  loginButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#fc5c2d',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 14px rgba(252,92,45,0.4)',
  } as const,
  loginIcon: {
    flexShrink: 0,
  } as const,
  note: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '1.5rem 0 0',
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
