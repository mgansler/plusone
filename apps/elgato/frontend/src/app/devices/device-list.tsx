import { Link, Outlet } from '@tanstack/react-router'

import type { DeviceListResponse } from '@plusone/elgato-api-client'
import { useValidatedDeviceList } from '@plusone/elgato-api-client'

import { deviceDetailsRoute } from '../../routes'

import { DevicePowerStateControl } from './device-power-state-control'

type DeviceListItemProps = {
  device: DeviceListResponse['devices'][0]
}

function DeviceListItem({ device }: DeviceListItemProps) {
  return (
    <div className={'aspect-square flex flex-col justify-center items-center border-2 rounded md:w-48'}>
      <DevicePowerStateControl deviceId={device.id} />
      <p>{device.displayName}</p>
      <Link to={deviceDetailsRoute.to} params={{ deviceId: device.id }}>
        Details
      </Link>
    </div>
  )
}

export function DeviceList() {
  const { data } = useValidatedDeviceList()

  return (
    <>
      <div className={'my-4 mx-auto md:mx-2 grid grid-cols-2 gap-2 md:flex md:flex-wrap'}>
        {data?.devices.map((device) => <DeviceListItem key={device.id} device={device} />)}
      </div>

      <Outlet />
    </>
  )
}
