import { useNavigate } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { useCreateGroup, useValidatedGroupList } from '@plusone/elgato-api-client'

export function Settings() {
  const newGroupNameRef = useRef<HTMLInputElement>()
  const newGroupIsRoomRef = useRef<HTMLInputElement>()

  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const { data, queryKey } = useValidatedGroupList()
  const { mutate } = useCreateGroup({ mutation: { onSuccess: () => queryClient.invalidateQueries(queryKey) } })

  const addGroup = () => {
    const name = newGroupNameRef.current.value
    const isRoom = newGroupNameRef.current.checked

    mutate({ data: { name, isRoom } })
  }

  return (
    <>
      <h3>Settings</h3>
      <button onClick={() => navigate(-1)}>Back</button>

      <div>
        <h4>Groups</h4>
        {data?.groups.map((group) => (
          <div>
            <Link key={group.id} to={`/settings/${group.id}`}>
              {group.name}
            </Link>
          </div>
        ))}

        <input type={'text'} ref={newGroupNameRef} />
        <input type={'checkbox'} ref={newGroupIsRoomRef} />
        <button onClick={addGroup}>Add</button>
      </div>
    </>
  )
}
