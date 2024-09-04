import { Link, Outlet } from '@tanstack/react-router'

import type { DeviceListResponseDto } from '@plusone/elgato-api-client'
import { useValidatedDeviceList } from '@plusone/elgato-api-client'

import { deviceDetailsRoute } from '../../routes'

import { DevicePowerStateControl } from './device-power-state-control'

type DeviceListItemProps = {
  device: DeviceListResponseDto['devices'][0]
}

function DeviceListItem({ device }: DeviceListItemProps) {
  return (
    <div className={'aspect-square flex flex-col justify-center items-center border-2 rounded md:w-48'}>
      <DevicePowerStateControl macAddress={device.macAddress} />
      <p>{device.displayName}</p>
      <Link to={deviceDetailsRoute.to} params={{ macAddress: device.macAddress }}>
        Details
      </Link>
    </div>
  )
}

export function DeviceList() {
  const { data } = useValidatedDeviceList({ query: { refetchInterval: 10_000 } })

  return (
    <>
      <div className={'my-4 mx-auto md:mx-2 grid grid-cols-2 gap-2 md:flex md:flex-wrap'}>
        {data?.devices.map((device) => <DeviceListItem key={device.macAddress} device={device} />)}
      </div>

      <Outlet />
    </>
  )
}
