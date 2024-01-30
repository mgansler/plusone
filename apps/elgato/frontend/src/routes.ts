import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { App } from './app/app'
import { DeviceDetails } from './app/devices/device-details'
import { DeviceList } from './app/devices/device-list'
import { Discovery } from './app/discovery/discovery'
import { Settings } from './app/settings/settings'

const rootRoute = createRootRoute({ component: App })

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DeviceList,
})

export const deviceDetailsRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/devices/$macAddress',
  component: DeviceDetails,
})

export const discoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discovery',
  component: Discovery,
})

export const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/settings', component: Settings })
export const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([deviceDetailsRoute]),
  discoveryRoute,
  settingsRoute,
])
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router
  }
}
