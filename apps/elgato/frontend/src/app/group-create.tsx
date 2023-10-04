import { useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { getGroupListQueryKey, useCreateGroup } from '@plusone/elgato-api-client'

export function GroupCreate() {
  const groupNameRef = useRef<HTMLInputElement>()
  const isRoomRef = useRef<HTMLInputElement>()

  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const { mutateAsync } = useCreateGroup({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getGroupListQueryKey())
      },
    },
  })

  const createGroup = async () => {
    const name = groupNameRef.current.value
    const isRoom = isRoomRef.current.checked
    const resp = await mutateAsync({ data: { name, isRoom } })
    navigate(`/${resp.id}`)
  }

  return (
    <div>
      <input type={'text'} ref={groupNameRef} />
      <input type={'checkbox'} ref={isRoomRef} />
      <button onClick={createGroup}>Create group</button>
    </div>
  )
}
