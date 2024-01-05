import { Device } from '@plusone/elgato-persistence'

import { DeviceType } from '../modules/device/enum/device-type'

export function getDevice(type: DeviceType): Device {
  return {
    id: 'aa:bb:cc:dd:ee:ff',
    displayName: `My ${type === DeviceType.LightStrip ? 'Light Strip' : 'Ring Light'}`,
    lastSeen: new Date(),
    type: type,
    address: `my-${type}-device`,
    port: 9123,
    sunrise: false,
    sunset: false,
  }
}
