import { DeviceType } from '../modules/device/enum/device-type'

export function mapProductNameToDeviceType(productName: string): DeviceType {
  switch (productName) {
    case 'Elgato Ring Light':
      return DeviceType.RingLight
    case 'Elgato Light Strip':
      return DeviceType.LightStrip
    default:
      return DeviceType.Unknown
  }
}
