import { QueryClient, QueryClientProvider } from 'react-query'
import { lazy, Suspense } from 'react'

import { AuthenticationProvider, useUser } from '@plusone/feeds/web/login'

import { Logout } from './logout'

const FeedsWebAdminView = lazy(() => import('@plusone/feeds/web/admin-view'))
const FeedsWebUserView = lazy(() => import('@plusone/feeds/web/user-view'))

const queryClient = new QueryClient()

function AppWithProviders() {
  const user = useUser()
  return (
    <>
      <h1>Welcome to web!</h1>
      <Logout />
      {user.isAdmin ? (
        <Suspense fallback={'loading...'}>
          <FeedsWebAdminView />
        </Suspense>
      ) : (
        <Suspense fallback={'loading...'}>
          <FeedsWebUserView />
        </Suspense>
      )}
    </>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticationProvider>
        <AppWithProviders />
      </AuthenticationProvider>
    </QueryClientProvider>
  )
}
