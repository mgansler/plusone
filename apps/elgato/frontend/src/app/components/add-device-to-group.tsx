import { useQueryClient } from '@tanstack/react-query'
import { Button } from 'flowbite-react'

import type { GroupResponseDto } from '@plusone/elgato-api-client'
import { getGroupDetailsQueryKey, useAddDeviceToGroup } from '@plusone/elgato-api-client'

type AddDeviceToGroupProps = {
  deviceId: string
  group: GroupResponseDto
}

export function AddDeviceToGroup({ deviceId, group }: AddDeviceToGroupProps) {
  const queryClient = useQueryClient()
  const { mutate: addDevice } = useAddDeviceToGroup({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGroupDetailsQueryKey(Number(group.id)),
        })
      },
    },
  })

  const handleClick = () => {
    console.log('adding device?')
    addDevice({ id: deviceId, data: { groupId: group.id } })
  }

  return <Button onClick={handleClick}>Add To {group.name}</Button>
}
