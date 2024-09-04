import { ApiProperty } from '@nestjs/swagger'

class WifiInfo {
  @ApiProperty()
  ssid: string

  @ApiProperty()
  frequencyMhz: number

  @ApiProperty()
  rssi: number
}

export class ElgatoAccessoryInfoResponseDto {
  @ApiProperty()
  productName: string

  @ApiProperty()
  hardwareBoardType: number

  @ApiProperty()
  hardwareRevision: number

  @ApiProperty()
  macAddress: string

  @ApiProperty()
  firmwareBuildNumber: number

  @ApiProperty()
  firmwareVersion: string

  @ApiProperty()
  serialNumber: string

  @ApiProperty()
  displayName: string

  @ApiProperty({ type: [String] })
  features: Array<string>

  @ApiProperty({ type: () => WifiInfo })
  'wifi-info': WifiInfo
}
