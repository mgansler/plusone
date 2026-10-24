import { createRootRoute } from '@tanstack/react-router'

import { AuthProvider } from '../lib/auth-context'
import { App } from '../app'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
