import { Outlet, useLocation } from '@tanstack/react-router'

import { useAuth } from './lib/auth-context'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TopBar } from './components/TopBar'

/** Public routes that don't require authentication. */
const PUBLIC_ROUTES = new Set(['/login', '/callback', '/datenschutz', '/impressum', '/'])

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
        <TopBar userName={user?.name} onLogout={logout} />
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
}
