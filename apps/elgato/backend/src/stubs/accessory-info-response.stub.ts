import { ElgatoAccessoryInfoResponseDto } from '../modules/elgato/dto/elgato-accessory-info-response.dto'

export function getAccessoryInfoResponse(
  accessoryInfo: Partial<ElgatoAccessoryInfoResponseDto>,
): ElgatoAccessoryInfoResponseDto {
  return {
    'wifi-info': {
      ssid: 'my-wifi',
      frequencyMhz: 2400,
      rssi: -50,
    },
    displayName: 'My Generic Display Name',
    features: ['lights'],
    firmwareBuildNumber: 42,
    firmwareVersion: '0.0.1',
    hardwareBoardType: 70,
    hardwareRevision: 1,
    macAddress: 'AA:BB:CC:DD:EE:FF',
    productName: 'Elgato Light Strip',
    serialNumber: 'EW00K1A00001',
    ...accessoryInfo,
  }
}
