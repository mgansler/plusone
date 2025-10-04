import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { App } from './app/app'
import { Egg } from './app/egg'

export const COUNTRY_PATH = '/country/$country'
export const STATE_PATH = COUNTRY_PATH + '/state/$state'
export const TRAIL_AREA_PATH = STATE_PATH + '/trailArea/$trailArea'

const rootRoute = createRootRoute()

export const indexRoute = createRoute({ getParentRoute: () => rootRoute, component: App, path: '/' })
const countryRoute = createRoute({
  getParentRoute: () => indexRoute,
  component: App,
  path: COUNTRY_PATH,
})
const stateRoute = createRoute({
  getParentRoute: () => countryRoute,
  component: App,
  path: STATE_PATH,
})
const trailAreaRoute = createRoute({
  getParentRoute: () => stateRoute,
  component: App,
  path: TRAIL_AREA_PATH,
})

const eggRoute = createRoute({ getParentRoute: () => rootRoute, component: Egg, path: '/egg' })

const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([eggRoute, countryRoute.addChildren([stateRoute.addChildren([trailAreaRoute])])]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  type Register = {
    router: typeof router
  }
}
