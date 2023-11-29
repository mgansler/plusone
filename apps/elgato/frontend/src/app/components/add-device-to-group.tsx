import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from 'flowbite-react'

import { getGroupDetailsQueryKey, useAddDeviceToGroup } from '@plusone/elgato-api-client'
import type { GroupResponseDto } from '@plusone/elgato-api-client'

type AddDeviceToGroupProps = {
  deviceId: string
  group: GroupResponseDto
  queryKeys?: QueryKey[]
}

export function AddDeviceToGroup({ deviceId, group, queryKeys }: AddDeviceToGroupProps) {
  const queryClient = useQueryClient()
  const { mutate: addDevice } = useAddDeviceToGroup({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGroupDetailsQueryKey(Number(group.id)),
        })
        for (const queryKey of queryKeys) {
          await queryClient.invalidateQueries({ queryKey })
        }
      },
    },
  })

  const handleClick = () => {
    addDevice({ id: deviceId, data: { groupId: group.id } })
  }

  return <Button onClick={handleClick}>Add To {group.name}</Button>
}
