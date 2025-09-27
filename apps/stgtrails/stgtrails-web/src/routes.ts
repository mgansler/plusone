import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { App } from './app/app'

export const COUNTRY_PATH = '/country/$country'
export const STATE_PATH = COUNTRY_PATH + '/state/$state'
export const TRAIL_AREA_PATH = STATE_PATH + '/trailArea/$trailArea'

export const rootRoute = createRootRoute({ component: App })

export const indexRoute = createRoute({ getParentRoute: () => rootRoute, component: App, path: '/' })
export const countryRoute = createRoute({
  getParentRoute: () => indexRoute,
  component: App,
  path: COUNTRY_PATH,
})
export const stateRoute = createRoute({
  getParentRoute: () => countryRoute,
  component: App,
  path: STATE_PATH,
})
export const trailAreaRoute = createRoute({
  getParentRoute: () => stateRoute,
  component: App,
  path: TRAIL_AREA_PATH,
})

const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([countryRoute.addChildren([stateRoute.addChildren([trailAreaRoute])])]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  type Register = {
    router: typeof router
  }
}
