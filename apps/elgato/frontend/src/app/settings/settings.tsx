import { useNavigate } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { useCreateGroup, useValidatedDeviceList, useValidatedGroupList } from '@plusone/elgato-api-client'
import type { DeviceResponseDto } from '@plusone/elgato-api-client'

import { DeviceSettings } from './device-settings'
import { LocationSettings } from './location-settings'

export function Settings() {
  const newGroupNameRef = useRef<HTMLInputElement>()
  const newGroupIsRoomRef = useRef<HTMLInputElement>()

  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const { data: { groups } = {}, queryKey } = useValidatedGroupList()
  const { data: { devices } = {} } = useValidatedDeviceList()
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
        <h4>Location</h4>
        <LocationSettings />
      </div>

      <div>
        <h4>Groups</h4>
        {groups?.map((group) => (
          <div key={group.id}>
            <Link to={`/settings/${group.id}`}>{group.name}</Link>
          </div>
        ))}

        <h4>Devices</h4>
        {devices?.map((device: DeviceResponseDto) => (
          <DeviceSettings key={device.id} device={device} />
        ))}

        <input type={'text'} ref={newGroupNameRef} />
        <input type={'checkbox'} ref={newGroupIsRoomRef} />
        <button onClick={addGroup}>Add</button>
      </div>
    </>
  )
}
