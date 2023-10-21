import { useParams } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'

import type { DevicePowerState } from '@plusone/elgato-api-client'
import { getDeviceDetailsQueryKey, useControlGroupState, useValidatedGroupDetails } from '@plusone/elgato-api-client'

import { DevicePowerStateControl } from '../devices/device-power-state-control'

export function GroupDetails() {
  const { groupId } = useParams()

  const queryClient = useQueryClient()
  const { data, isLoading } = useValidatedGroupDetails(Number(groupId))
  const { mutate } = useControlGroupState({
    mutation: {
      onSuccess: () => {
        for (const device of data.devices) {
          queryClient.invalidateQueries(getDeviceDetailsQueryKey(device.id))
        }
      },
    },
  })

  const controlGroupState = (desiredPowerState: DevicePowerState) => {
    mutate({ groupId: Number(groupId), data: { desiredPowerState } })
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      <div>
        <button onClick={() => controlGroupState('on')}>Turn all devices on</button>
        <button onClick={() => controlGroupState('off')}>Turn all devices off</button>
      </div>

      {data.devices.map((device) => (
        <div key={device.id}>
          <span>{device.name}</span>
          <DevicePowerStateControl deviceId={device.id} />
        </div>
      ))}
    </>
  )
}
