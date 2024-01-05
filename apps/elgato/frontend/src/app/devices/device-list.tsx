import { Link, Outlet } from '@tanstack/react-router'
import type { z } from 'zod'

import { useValidatedDeviceList } from '@plusone/elgato-api-client'

import type { deviceListResponse } from '../../../../../../libs/elgato/api-client/src/zod'
import { deviceDetailsRoute } from '../../routes'

import { DevicePowerStateControl } from './device-power-state-control'

type DeviceListItemProps = {
  device: z.infer<typeof deviceListResponse>['devices'][0]
}

function DeviceListItem({ device }: DeviceListItemProps) {
  return (
    <div className={'basis-1/2 md:basis-1/4 p-1'}>
      <div className={'aspect-square flex flex-col justify-center items-center border-2 rounded'}>
        <DevicePowerStateControl deviceId={device.id} />
        <p>{device.displayName}</p>
        <Link to={deviceDetailsRoute.to} params={{ deviceId: device.id }}>
          Details
        </Link>
      </div>
    </div>
  )
}

export function DeviceList() {
  const { data } = useValidatedDeviceList()

  return (
    <>
      <div className={'my-4 mx-auto md:mx-2 flex flex-row flex-wrap md:max-w-3xl'}>
        {data?.devices.map((device) => <DeviceListItem key={device.id} device={device} />)}
      </div>

      <Outlet />
    </>
  )
}
