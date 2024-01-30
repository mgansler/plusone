import { RootRoute, Route, Router } from '@tanstack/react-router'

import { App } from './app/app'
import { DeviceDetails } from './app/devices/device-details'
import { DeviceList } from './app/devices/device-list'
import { Discovery } from './app/discovery/discovery'
import { Settings } from './app/settings/settings'

const rootRoute = new RootRoute({ component: App })

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DeviceList,
})

export const deviceDetailsRoute = new Route({
  getParentRoute: () => indexRoute,
  path: '/devices/$macAddress',
  component: DeviceDetails,
})

export const discoveryRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/discovery',
  component: Discovery,
})

export const settingsRoute = new Route({ getParentRoute: () => rootRoute, path: '/settings', component: Settings })
export const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([deviceDetailsRoute]),
  discoveryRoute,
  settingsRoute,
])
export const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  type Register = {
    router: typeof router
  }
}
