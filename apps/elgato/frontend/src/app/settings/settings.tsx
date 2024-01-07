import { Link } from '@tanstack/react-router'

import { useValidatedDeviceList } from '@plusone/elgato-api-client'

import { DeviceSettings } from './device-settings'
import { LocationSettings } from './location-settings'

export function Settings() {
  const { data: { devices } = {} } = useValidatedDeviceList()

  return (
    <div>
      <h2>Settings</h2>
      <Link to={'..'}>Back</Link>

      <div>
        <h4>Location</h4>
        <LocationSettings />
      </div>

      <div>
        <h4>Devices</h4>
        {devices?.map((device) => <DeviceSettings key={device.macAddress} device={device} />)}
      </div>
    </div>
  )
}
