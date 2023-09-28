import { useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { getRoomListQueryKey, useCreateRoom } from '@plusone/elgato-api-client'

export function RoomCreate() {
  const roomNameRef = useRef<HTMLInputElement>()

  const queryClient = useQueryClient()
  const { mutate } = useCreateRoom({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getRoomListQueryKey())
      },
    },
  })

  const createRoom = () => {
    const name = roomNameRef.current.value
    mutate({ data: { name } })
  }

  return (
    <div>
      <input type={'text'} ref={roomNameRef} />
      <button onClick={createRoom}>Create room</button>
    </div>
  )
}
