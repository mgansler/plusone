import { useNavigate, useParams } from '@remix-run/react'

import type { DeviceListResponseDto, DeviceResponseDto, GroupWithDevicesResponseDto } from '@plusone/elgato-api-client'
import { useValidatedDeviceList, useValidatedGroupDetails } from '@plusone/elgato-api-client'

import { AddDeviceToGroup } from '../components/add-device-to-group'

type FilteredDevicesProps = {
  group?: GroupWithDevicesResponseDto
  devices?: DeviceListResponseDto['devices']
}

function FilteredDevices({ group, devices }: FilteredDevicesProps) {
  if (!group || !devices) {
    return null
  }

  return (
    <>
      <br />
      {devices
        .filter((device) => group?.devices.find(({ id }) => id === device.id) === undefined)
        .map((device) => (
          <AddDeviceToGroup key={device.id} deviceId={device.id} group={group} />
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
