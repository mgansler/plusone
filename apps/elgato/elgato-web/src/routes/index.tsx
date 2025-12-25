import { createFileRoute, Outlet } from '@tanstack/react-router'

import { useValidatedDeviceList } from '@plusone/elgato-api-client'

import { DeviceListItem } from '../app/devices/device-list-item'

export const Route = createFileRoute('/')({
  component: DeviceListComponent,
})

function DeviceListComponent() {
  const { data } = useValidatedDeviceList({ query: { refetchInterval: 10_000 } })

  return (
    <>
      <div className={'my-4 mx-auto md:mx-2 grid grid-cols-2 gap-2 md:flex md:flex-wrap'}>
        {data?.devices.map((device) => (
          <DeviceListItem key={device.macAddress} device={device} />
        ))}
      </div>

      <Outlet />
    </>
  )
}
