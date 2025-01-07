import { Device } from '@plusone/elgato-persistence'

import { DeviceType } from '../modules/device/enum/device-type'

export function getDevice(type: keyof typeof DeviceType, lastSeen: Date = new Date()): Device {
  return {
    macAddress: 'aa:bb:cc:dd:ee:ff',
    displayName: `My ${type === DeviceType.LightStrip ? 'Light Strip' : 'Ring Light'}`,
    lastSeen,
    type: type,
    address: `my-${type}-device`,
    port: 9123,
    sunrise: false,
    sunset: false,
  }
}
