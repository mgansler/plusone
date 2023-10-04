import { useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { useToggleDevice, useValidatedDeviceDetails } from '@plusone/elgato-api-client'

export function DeviceDetails() {
  const { deviceId } = useParams()

  const queryClient = useQueryClient()
  const { data, isLoading, queryKey } = useValidatedDeviceDetails(deviceId)
  const { mutateAsync } = useToggleDevice({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKey)
      },
    },
  })

  if (isLoading) {
    return null
  }

  async function toggle() {
    await mutateAsync({ id: deviceId })
  }

  return (
    <div>
      <Link to={'..'}>Back</Link>

      <div>Id: {data.id}</div>
      <div>Name: {data.name}</div>
      <div>
        <div>Display Name: {data.details.displayName}</div>
        <div>Product Name: {data.details.productName}</div>
        <button onClick={toggle}>{data.state.on ? 'Turn off' : 'Turn on'}</button>
      </div>
    </div>
  )
}
