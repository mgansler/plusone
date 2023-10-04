import { useQueryClient } from '@tanstack/react-query'

import { useAddDeviceToGroup, useValidatedGroupDetails, useValidatedListDevices } from '@plusone/elgato-api-client'

type AddDeviceProps = {
  groupId: number
}

export function AddDevices({ groupId }: AddDeviceProps) {
  const queryClient = useQueryClient()
  const { data: groupDetails, isLoading: isLoadingGroupDetails, queryKey } = useValidatedGroupDetails(groupId)
  const { data: deviceList, isLoading: isLoadingDeviceList } = useValidatedListDevices()
  const { mutate: addToGroup } = useAddDeviceToGroup({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKey)
      },
    },
  })

  const addDevice = (deviceId: string) => {
    addToGroup({ id: deviceId, data: { groupId } })
  }

  if (isLoadingGroupDetails || isLoadingDeviceList) {
    return null
  }

  return (
    <>
      <div>Add devices</div>
      {deviceList.devices
        .filter((device) => groupDetails.devices.find(({ id }) => id === device.id) === undefined)
        .map((device) => (
          <button key={device.id} onClick={() => addDevice(device.id)}>
            {device.name}
          </button>
        ))}
    </>
  )
}
