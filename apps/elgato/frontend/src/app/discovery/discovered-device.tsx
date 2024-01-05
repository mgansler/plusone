import { useQueryClient } from '@tanstack/react-query'

import type { DiscoveredDevicesResponse } from '@plusone/elgato-api-client'
import { getDiscoveredDevicesQueryKey, useAddDiscoveredDevice } from '@plusone/elgato-api-client'

type DiscoveredDeviceProps = {
  device: DiscoveredDevicesResponse
}

export function DiscoveredDevice({ device }: DiscoveredDeviceProps) {
  const queryClient = useQueryClient()
  const { mutate } = useAddDiscoveredDevice({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getDiscoveredDevicesQueryKey() })
      },
    },
  })

  const handleAddDevice = () => {
    mutate({ deviceId: device.id })
  }

  return (
    <div>
      <h3>{device.displayName}</h3>
      {!device.isControlled && <button onClick={handleAddDevice}>Add</button>}
    </div>
  )
}
