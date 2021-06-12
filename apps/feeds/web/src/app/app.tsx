import { QueryClient, QueryClientProvider } from 'react-query'
import { lazy, Suspense } from 'react'
import { CssBaseline } from '@material-ui/core'

import { AuthenticationProvider, useUser } from '@plusone/feeds/web/login'
import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

import { Logout } from './logout'

const FeedsWebAdminView = lazy(() => import('@plusone/feeds/web/admin-view'))
const FeedsWebUserView = lazy(() => import('@plusone/feeds/web/user-view'))

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

const queryClient = new QueryClient()

export function App() {
  return (
    <DarkModeThemeProvider>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider>
          <AppWithProviders />
        </AuthenticationProvider>
      </QueryClientProvider>
    </DarkModeThemeProvider>
  )
}
