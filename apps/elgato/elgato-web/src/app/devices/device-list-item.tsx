import { Link } from '@tanstack/react-router'
import type { Attributes } from 'react'

import type { DeviceListResponseDto } from '@plusone/elgato-api-client'

import { Route as DeviceDetailsRoute } from '../../routes/devices/$macAddress'

import { DevicePowerStateControl } from './device-power-state-control'

type DeviceListItemProps = Attributes & {
  device: DeviceListResponseDto['devices'][0]
}

export function DeviceListItem({ device }: DeviceListItemProps) {
  return (
    <div
      className={'aspect-square flex flex-col justify-center items-center border-2 border-gray-200 rounded-sm md:w-48'}
    >
      <DevicePowerStateControl macAddress={device.macAddress} />
      <p>{device.displayName}</p>
      <Link to={DeviceDetailsRoute.to} params={{ macAddress: device.macAddress }}>
        Details
      </Link>
    </div>
  )
}
