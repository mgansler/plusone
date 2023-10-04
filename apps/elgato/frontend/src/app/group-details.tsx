import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useControlGroupState, useToggleDevice, useValidatedGroupDetails } from '@plusone/elgato-api-client'

import { AddDevices } from './add-devices'

export function GroupDetails() {
  const { groupId } = useParams()
  const { data, isLoading, queryKey } = useValidatedGroupDetails(Number(groupId))

  const queryClient = useQueryClient()
  const options = {
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKey)
      },
    },
  }
  const { mutate: toggleDevice } = useToggleDevice(options)
  const { mutate: toggleRoom } = useControlGroupState(options)

  if (isLoading) {
    return null
  }

  return (
    <div>
      <button onClick={() => toggleRoom({ groupId: Number(groupId), data: { desiredPowerState: 'on' } })}>
        Turn all devices on
      </button>
      <button onClick={() => toggleRoom({ groupId: Number(groupId), data: { desiredPowerState: 'off' } })}>
        Turn all devices off
      </button>

      {data.devices.map((device) => (
        <div key={device.id}>
          <div>{device.name}</div>
          <button onClick={() => toggleDevice({ id: device.id })}>{device.state.on ? 'Turn off' : 'Turn on'}</button>
        </div>
      ))}

      <AddDevices groupId={Number(groupId)} />
    </div>
  )
}
