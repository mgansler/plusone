import { useNavigate, useParams } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'

import type { DeviceListResponseDto, DeviceResponseDto, GroupWithDevicesResponseDto } from '@plusone/elgato-api-client'
import {
  getGroupDetailsQueryKey,
  useAddDeviceToGroup,
  useValidatedDeviceList,
  useValidatedGroupDetails,
} from '@plusone/elgato-api-client'

type FilteredDevicesProps = {
  group?: GroupWithDevicesResponseDto
  devices?: DeviceListResponseDto['devices']
}

function FilteredDevices({ group, devices }: FilteredDevicesProps) {
  const { groupId } = useParams()

  const queryClient = useQueryClient()
  const { mutate } = useAddDeviceToGroup({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGroupDetailsQueryKey(Number(groupId)),
        })
      },
    },
  })

  const addDevice = (deviceId) => {
    mutate({ id: deviceId, data: { groupId: Number(groupId) } })
  }

  if (!group || !devices) {
    return null
  }

  return (
    <>
      <br />
      {devices
        .filter((device) => group?.devices.find(({ id }) => id === device.id) === undefined)
        .map((device) => (
          <button key={device.id} onClick={() => addDevice(device.id)}>
            Add {device.name}
          </button>
        ))}
    </>
  )
}

export function GroupSettings() {
  const { groupId } = useParams()
  const navigate = useNavigate()

  const { data: group } = useValidatedGroupDetails(Number(groupId))
  const { data } = useValidatedDeviceList()

  return (
    <>
      <h3>Group Settings {group?.name}</h3>
      <button onClick={() => navigate(-1)}>Back</button>

      {group?.devices.map((device) => (
        <div key={device.id}>{device.name}</div>
      ))}

      <FilteredDevices group={group as GroupWithDevicesResponseDto} devices={data?.devices as DeviceResponseDto[]} />
    </>
  )
}
