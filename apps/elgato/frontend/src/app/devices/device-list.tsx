import { Link, Outlet } from 'react-router-dom'

import { useValidatedDeviceList } from '@plusone/elgato-api-client'

import { DevicePowerStateControl } from './device-power-state-control'

export function DeviceList() {
  const { data, isLoading } = useValidatedDeviceList()

  if (isLoading) {
    return null
  }

  return (
    <>
      {data.devices.map((device) => (
        <div key={device.id}>
          <span>{device.name}</span>
          <Link to={device.id}>Details</Link>
          <DevicePowerStateControl deviceId={device.id} />
        </div>
      ))}

      <Outlet />
    </>
  )
}
