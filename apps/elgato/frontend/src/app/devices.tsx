import { Link, Outlet } from 'react-router-dom'

import { useValidatedListDevices } from '@plusone/elgato-api-client'

export function Devices() {
  const { data, isLoading } = useValidatedListDevices()

  if (isLoading) {
    return null
  }

  return (
    <>
      <ul>
        {data!.devices.map((device) => (
          <li key={device.id}>
            <Link to={`/device/${device.id}`}>{device.name}</Link>
          </li>
        ))}
      </ul>

      <Outlet />
    </>
  )
}
