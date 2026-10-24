import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { handleOAuthCallback } from './lib/auth-context'
import './styles.css'

// Handle OAuth callback: if the app was opened with #token=xxx in the URL,
// extract the token, store it in localStorage, and clear the hash.
const hasToken = handleOAuthCallback()

// If we just handled a callback, wait for the auth context to pick it up
// then navigate to home.
if (hasToken) {
  // The auth context checks localStorage on mount, so we just need to
  // let the app initialize. After auth is resolved, navigate to '/'.
  setTimeout(() => {
    // Clear any remaining hash
    window.location.hash = ''
  }, 500)
}

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div style={{ padding: 16, textAlign: 'center', marginTop: '20vh', color: '#666' }}>Loading...</div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
