import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createQueryClient } from './lib/query-client'
import { routeTree } from './routeTree.gen'

import './styles.css'

const queryClient = createQueryClient()
const router = createRouter({ routeTree, context: { queryClient }, scrollRestoration: true })

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation needs an interface
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
