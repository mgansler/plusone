import * as React from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import { Route as CommandsRoute } from './commands'
import { Route as DiscoveryRoute } from './discovery'
import { Route as SettingsRoute } from './settings'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className={'flex flex-col'}>
      <h1>Elgato Control</h1>

      <Outlet />

      <Link to={CommandsRoute.to}>Commands</Link>
      <Link to={DiscoveryRoute.to}>Discovery</Link>
      <Link to={SettingsRoute.to}>Settings</Link>
    </div>
  )
}
