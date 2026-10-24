import { Outlet, useLocation } from '@tanstack/react-router'

import { useAuth } from './lib/auth-context'

/** Public routes that don't require authentication. */
const PUBLIC_ROUTES = new Set(['/login', '/callback'])

/**
 * Main app shell.
 * - While loading: shows spinner
 * - On public routes (/login, /callback): renders Outlet (the child route component)
 * - Not authenticated: shows login card
 * - Authenticated: renders topbar + Outlet (child route content)
 */
export function App() {
  const { isAuthenticated, isLoading, login, user, logout } = useAuth()
  const location = useLocation()

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
      </div>
    )
  }

  // On a public route — render the child route via Outlet
  if (PUBLIC_ROUTES.has(location.pathname)) {
    return <Outlet />
  }

  // Not authenticated — show login card in the main area
  if (!isAuthenticated) {
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

  // Authenticated — render topbar + child route content
  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <a href="/" style={styles.brand}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 6 }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          GPX-Toolbox
        </a>
        <div style={styles.topbarRight}>
          {user?.name && <span style={styles.userName}>{user.name}</span>}
          <a href="/routes" style={styles.topbarLink}>
            Routen
          </a>
          <a href="/nearby" style={styles.topbarLink}>
            In der Nähe
          </a>
          <a href="/debug" style={styles.topbarLink}>
            Debug
          </a>
          <button onClick={logout} style={styles.logoutButton}>
            Abmelden
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}

const styles = {
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  } as const,
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fc5c2d',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  } as const,
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  } as const,
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '3rem 2.5rem',
    maxWidth: 420,
    margin: 'auto',
    textAlign: 'center' as const,
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
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderBottom: '1px solid #334155',
    height: 48,
    flexShrink: 0,
  } as const,
  brand: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f8fafc',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  } as const,
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } as const,
  userName: {
    fontSize: 13,
    color: '#94a3b8',
  } as const,
  topbarLink: {
    fontSize: 13,
    color: '#60a5fa',
    textDecoration: 'none',
  } as const,
  logoutButton: {
    fontSize: 13,
    color: '#f87171',
    background: 'none',
    border: '1px solid #f87171',
    borderRadius: 4,
    padding: '2px 10px',
    cursor: 'pointer',
  } as const,
}

// Inject keyframes for the spinner
if (typeof document !== 'undefined') {
  const styleId = 'gpx-toolbox-spinner'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
    document.head.appendChild(style)
  }
}
