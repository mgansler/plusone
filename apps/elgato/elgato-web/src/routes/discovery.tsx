import { createFileRoute, Link } from '@tanstack/react-router'

import { useValidatedDiscoveredDevicesList } from '@plusone/elgato-api-client'

import { DiscoveredDevice } from '../app/discovery/discovered-device'
import { ManualDevice } from '../app/discovery/manual-device'

import { Route as IndexRoute } from './index'

export const Route = createFileRoute('/discovery')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: discoveredDevices } = useValidatedDiscoveredDevicesList()

  return (
    <div>
      <h2>Discovery</h2>
      <Link to={IndexRoute.to}>Back</Link>

      {discoveredDevices?.devices.map((device) => (
        <DiscoveredDevice key={device.id} device={device} />
      ))}

      <ManualDevice />
    </div>
  )
}
