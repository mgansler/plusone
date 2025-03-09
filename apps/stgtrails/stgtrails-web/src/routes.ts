import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { App } from './app/app'

export const rootRoute = createRootRoute({ component: App })

export const indexRoute = createRoute({ getParentRoute: () => rootRoute, component: App, path: '/' })
export const countryRoute = createRoute({
  getParentRoute: () => indexRoute,
  component: App,
  path: `/country/$country`,
})
export const stateRoute = createRoute({
  getParentRoute: () => countryRoute,
  component: App,
  path: `/country/$country/state/$state`,
})

const routeTree = rootRoute.addChildren([indexRoute.addChildren([countryRoute.addChildren([stateRoute])])])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  type Register = {
    router: typeof router
  }
}
