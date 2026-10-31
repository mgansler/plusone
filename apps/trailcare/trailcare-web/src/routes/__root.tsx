import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Navigate, Outlet, useRouterState } from '@tanstack/react-router'

import { UndoProvider } from '../components/undo-toast'
import { useSession } from '../lib/session'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
})

function RootComponent() {
  const { isLoading, isUnavailable, retry, isAuthenticated, isAdmin } = useSession()
  // The route that is actually rendered: during a redirect the location changes before the matches do
  const routeId = useRouterState({ select: (state) => state.matches[state.matches.length - 1]?.routeId as string })
  const isLoginPage = routeId === '/login'

  if (isLoading) {
    return <div className="splash" aria-busy="true" />
  }

  if (isUnavailable) {
    return (
      <main className="login">
        <div className="login-form">
          <p className="form-error">Keine Verbindung zum Server. Bitte prüf deinen Empfang.</p>
          <button className="button button-primary" onClick={() => retry()}>
            Nochmal versuchen
          </button>
        </div>
      </main>
    )
  }

  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/login" replace />
  }

  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin && routeId.startsWith('/admin')) {
    return <Navigate to="/" replace />
  }

  return (
    <UndoProvider>
      <Outlet />
    </UndoProvider>
  )
}
