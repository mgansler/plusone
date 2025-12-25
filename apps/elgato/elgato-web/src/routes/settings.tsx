import { createFileRoute, Link } from '@tanstack/react-router'

import { LocationSettings } from '../app/settings/location-settings'
import { DevicesSettings } from '../app/settings/device-settings'

import { Route as IndexRoute } from './index'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h2>Settings</h2>
      <Link to={IndexRoute.to}>Back</Link>

      <LocationSettings />

      <DevicesSettings />
    </div>
  )
}
