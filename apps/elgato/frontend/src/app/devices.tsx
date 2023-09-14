import { Link } from 'react-router-dom'

import { useValidatedListDevices } from '@plusone/elgato-api-client'

export function Devices() {
  const { data, isLoading } = useValidatedListDevices()

  if (isLoading) {
    return 'loading...'
  }

  return (
    <>
      <Link to={'/'}>Click here to go back to the landing page.</Link>
      <ul>
        {data!.devices.map((device) => (
          <li key={device.id}>{device.name}</li>
        ))}
      </ul>
    </>
  )
}
