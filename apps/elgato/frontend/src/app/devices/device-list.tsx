import { Link, Outlet } from '@tanstack/react-router'
import { Fragment } from 'react'

import { useValidatedDeviceList } from '@plusone/elgato-api-client'

import { deviceDetailsRoute } from '../../routes'

import { DevicePowerStateControl } from './device-power-state-control'

export function DeviceList() {
  const { data } = useValidatedDeviceList()

  return (
    <div className={'max-w-96 my-4 grid grid-cols-[5fr_2fr_1fr]  gap-2'}>
      {data?.devices.map((device) => (
        <Fragment key={device.id}>
          <span>{device.displayName}</span>
          <Link to={deviceDetailsRoute.to} params={{ deviceId: device.id }}>
            Details
          </Link>
          <DevicePowerStateControl deviceId={device.id} />
        </Fragment>
      ))}

      <Outlet />
    </div>
  )
}
