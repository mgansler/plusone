import { Outlet, useLocation } from '@tanstack/react-router'

import { useAuth } from './lib/auth-context'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserMenu } from './components/UserMenu'

/** Public routes that don't require authentication. */
const PUBLIC_ROUTES = new Set(['/login', '/callback'])

/**
 * Main app shell.
 * - While loading: shows spinner
 * - On public routes (/login, /callback): renders Outlet (the child route component)
 * - Not authenticated: redirects to /login (via ProtectedRoute)
 * - Authenticated: renders topbar + Outlet (child route content)
 */
export function App() {
  const { isLoading, user, logout } = useAuth()
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

  // Wrap authenticated routes with ProtectedRoute (handles redirect)
  return (
    <ProtectedRoute>
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
            GPX-Toolcat
          </a>
          <div style={styles.topbarRight}>
            {user?.name && <UserMenu name={user.name} />}
            <a href="/activities" style={styles.topbarLink}>
              Aktivitäten
            </a>
            <a href="/nearby" style={styles.topbarLink}>
              In der Nähe
            </a>
            <a href="/utils" style={styles.topbarLink}>
              Utils
            </a>
            <a href="/debug" style={styles.topbarLink}>
              Debug
            </a>
            <button onClick={logout} style={styles.logoutButton}>
              Abmelden
            </button>
          </div>
        </div>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
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
    overflow: 'hidden',
  } as const,
  /** Remaining height below the topbar; pages with `height: 100%` fill exactly this, so the topbar never scrolls away */
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
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
