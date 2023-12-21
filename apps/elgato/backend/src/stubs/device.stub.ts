import { Device } from '@plusone/elgato-persistence'

import { DeviceType } from '../modules/device/enum/device-type'

export function getDevice(type: DeviceType): Device {
  return {
    id: 'aa:bb:cc:dd:ee:ff',
    fqdn: `My ${type === DeviceType.LightStrip ? 'Light Strip' : 'Ring Light'} Device._elg._tcp.local`,
    host: `my-${type}-device.local`,
    lastSeen: new Date(),
    name: `My ${type === DeviceType.LightStrip ? 'Light Strip' : 'Ring Light'} Device`,
    port: 9123,
    sunrise: false,
    sunset: false,
    type: type,
  }
}
