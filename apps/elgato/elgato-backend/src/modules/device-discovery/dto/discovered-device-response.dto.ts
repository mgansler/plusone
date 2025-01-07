import { ApiProperty } from '@nestjs/swagger'

import { DeviceType } from '../../device/enum/device-type'

export class DiscoveredDeviceResponseDto {
  @ApiProperty({ description: 'The mac address of the device.', example: 'aa:bb:cc:dd:ee:ff' })
  id: string

  @ApiProperty()
  macAddress: string

  @ApiProperty()
  name: string

  @ApiProperty()
  fqdn: string

  @ApiProperty()
  host: string

  @ApiProperty({ type: String, required: false, nullable: true, example: '192.168.0.50' })
  ipv4?: string | null

  @ApiProperty({ example: 9123 })
  port: number

  @ApiProperty({ example: 'Elgato Ring Light be4f' })
  displayName: string

  @ApiProperty({ example: 'Elgato Ring Light' })
  productName: string

  @ApiProperty({ enum: DeviceType, enumName: 'DeviceType' })
  type: keyof typeof DeviceType

  @ApiProperty()
  isControlled: boolean
}
