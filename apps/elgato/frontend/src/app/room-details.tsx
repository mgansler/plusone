import { useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { useControlRoomState, useToggleDevice, useValidatedRoomDetails } from '@plusone/elgato-api-client'

export function RoomDetails() {
  const { roomId } = useParams()

  const queryClient = useQueryClient()
  const { data, isLoading, queryKey } = useValidatedRoomDetails(Number(roomId))
  const { mutate: toggleDevice } = useToggleDevice({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKey)
      },
    },
  })

  const { mutate: toggleRoom } = useControlRoomState({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKey)
      },
    },
  })

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
