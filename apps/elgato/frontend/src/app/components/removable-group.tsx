import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import type { DeviceDetailsResponseDto, GroupResponseDto } from '@plusone/elgato-api-client'
import { getGroupDetailsQueryKey, useRemoveDeviceFromGroup } from '@plusone/elgato-api-client'
import { IconButton, TrashBin } from '@plusone/elgato-components'

type RemovableGroupProps = {
  group: GroupResponseDto
  deviceId: DeviceDetailsResponseDto['id']
  queryKeys?: QueryKey[]
}

export function RemovableGroup({ group, deviceId, queryKeys }: RemovableGroupProps) {
  const queryClient = useQueryClient()
  const { mutate } = useRemoveDeviceFromGroup({
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

  const handleRemove = () => {
    mutate({ id: deviceId, data: { groupId: group.id } })
  }

  return (
    <div className={'flex'}>
      {group.name}
      <IconButton icon={<TrashBin />} label={`Remove device from ${group.name}`} onClick={handleRemove} />
    </div>
  )
}
