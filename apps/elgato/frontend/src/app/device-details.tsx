import { Link, useParams } from 'react-router-dom'

import { useValidatedDeviceDetails } from '@plusone/elgato-api-client'

export function DeviceDetails() {
  const { deviceId } = useParams()
  const { data, isLoading } = useValidatedDeviceDetails(deviceId)

  if (isLoading) {
    return null
  }

  return (
    <div>
      <Link to={'..'}>Back</Link>

      <div>{data.id}</div>
      <div>{data.name}</div>
      <div>
        <div>{data.details.displayName}</div>
        <div>{data.details.productName}</div>
      </div>
    </div>
  )
}
