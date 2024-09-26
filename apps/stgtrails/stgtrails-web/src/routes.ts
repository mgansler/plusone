import { createRootRoute, createRouter } from '@tanstack/react-router'
import { z } from 'zod'

import { App } from './app/app'

export const rootRoute = createRootRoute({
  component: App,
  validateSearch: z.object({
    legacy: z.boolean().optional(),
  }),
})

const routeTree = rootRoute.addChildren([])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router
  }
}
