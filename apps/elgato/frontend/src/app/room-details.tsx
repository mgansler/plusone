import { useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { useControlRoomState, useToggleDevice, useValidatedRoomDetails } from '@plusone/elgato-api-client'

export function RoomDetails() {
  const { roomId } = useParams()
  const { data, isLoading, queryKey } = useValidatedRoomDetails(Number(roomId))

  const queryClient = useQueryClient()
  const options = {
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKey)
      },
    },
  }
  const { mutate: toggleDevice } = useToggleDevice(options)
  const { mutate: toggleRoom } = useControlRoomState(options)

  if (isLoading) {
    return null
  }

  return (
    <div>
      <Link to={'..'}>Back</Link>

      <button onClick={() => toggleRoom({ roomId: Number(roomId), data: { desiredPowerState: 'on' } })}>
        Turn all devices on
      </button>
      <button onClick={() => toggleRoom({ roomId: Number(roomId), data: { desiredPowerState: 'off' } })}>
        Turn all devices off
      </button>

      {data.devices.map((device) => (
        <div key={device.id}>
          <div>{device.name}</div>
          <button onClick={() => toggleDevice({ id: device.id })}>{device.state.on ? 'Turn off' : 'Turn on'}</button>
        </div>
      ))}
    </div>
  )
}
