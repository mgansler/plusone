import { useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'

import { getDeviceDetailsQueryKey, useAssignDeviceToRoom, useValidatedListRooms } from '@plusone/elgato-api-client'

type AssignToRoomProps = {
  roomId?: number
}

export function AssignToRoom({ roomId }: AssignToRoomProps) {
  const selectRef = useRef<HTMLSelectElement>()

  const { deviceId } = useParams()

  const queryClient = useQueryClient()
  const { data, isLoading } = useValidatedListRooms()
  const { mutate } = useAssignDeviceToRoom({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getDeviceDetailsQueryKey(deviceId))
      },
    },
  })

  const assignToRoom = () => {
    mutate({ id: deviceId, data: { roomId: Number(selectRef.current.value) } })
  }
  if (isLoading) {
    return null
  }

  return (
    <div>
      <select ref={selectRef} defaultValue={roomId}>
        {data.rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
      <button onClick={assignToRoom}>Assign to room</button>
    </div>
  )
}
