import { Navigate } from '@tanstack/react-router'

import { useAuth } from '../lib/auth-context'

/** Public routes that don't require authentication. */
const PUBLIC_ROUTES = new Set(['/login', '/callback'])

/**
 * Renders `children` if authenticated, otherwise redirects to `/login`.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#fc5c2d',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    )
  }

  if (!isAuthenticated && !PUBLIC_ROUTES.has(typeof window !== 'undefined' ? window.location.pathname : '')) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}
