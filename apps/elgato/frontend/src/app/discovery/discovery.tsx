import { Link } from '@tanstack/react-router'

import { useValidatedDiscoveredDevicesList } from '@plusone/elgato-api-client'

import { DiscoveredDevice } from './discovered-device'
import { ManualDevice } from './manual-device'

export function Discovery() {
  const { data: discoveredDevices } = useValidatedDiscoveredDevicesList()

  return (
    <div>
      <h2>Discovery</h2>
      <Link to={'..'}>Back</Link>

      {discoveredDevices?.devices.map((device) => <DiscoveredDevice key={device.id} device={device} />)}

      <ManualDevice />
    </div>
  )
}
