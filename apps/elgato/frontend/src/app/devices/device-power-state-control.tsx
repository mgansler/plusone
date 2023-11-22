import { useQueryClient } from '@tanstack/react-query'

import { useToggleDevice, useValidatedDeviceDetails } from '@plusone/elgato-api-client'

type DevicePowerStateProps = {
  deviceId: string
}

export function DevicePowerStateControl({ deviceId }: DevicePowerStateProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, queryKey, error } = useValidatedDeviceDetails(deviceId)
  const { mutate } = useToggleDevice({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey })
      },
    },
  })

  const toggle = () => mutate({ id: deviceId })

  if (isLoading) {
    return null
  }

  if (error) {
    return <span> is stuck</span>
  }

  return <button onClick={toggle}>{data.state.on ? 'Turn off' : 'Turn on'}</button>
}
