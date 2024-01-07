import { useQueryClient } from '@tanstack/react-query'

import { useDeviceSetPowerState, useToggleDevice, useValidatedDeviceDetails } from '@plusone/elgato-api-client'
import { PowerControl } from '@plusone/elgato-components'

type DevicePowerStateProps = {
  macAddress: string
}

export function DevicePowerStateControl({ macAddress }: DevicePowerStateProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, queryKey, error } = useValidatedDeviceDetails(macAddress)
  const mutation = {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  }
  const { mutate: toggleDevice } = useToggleDevice({ mutation })
  const { mutate: setDevicePowerState } = useDeviceSetPowerState({ mutation })

  const toggle = () => toggleDevice({ macAddress })
  const turnOff = () => setDevicePowerState({ macAddress, data: { on: false } })

  if (isLoading) {
    return null
  }

  if (error) {
    return (
      <span>
        {' '}
        is stuck<button onClick={turnOff}>Turn off</button>
      </span>
    )
  }

  return <PowerControl state={data.state.on ? 'on' : 'off'} onClick={toggle} />
}
