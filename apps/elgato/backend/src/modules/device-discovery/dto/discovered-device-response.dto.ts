import { ApiProperty } from '@nestjs/swagger'

import { DeviceType } from '../../device/enum/device-type'

export class DiscoveredDeviceResponseDto {
  @ApiProperty({ description: 'The mac address of the device.', example: 'aa:bb:cc:dd:ee:ff' })
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  fqdn: string

  @ApiProperty()
  host: string

  @ApiProperty({ example: '192.168.0.50' })
  ipv4: string

  @ApiProperty({ example: 9123 })
  port: number

  @ApiProperty({ example: 'Elgato Ring Light be4f' })
  displayName: string

  @ApiProperty({ example: 'Elgato Ring Light' })
  productName: string

  @ApiProperty({ enum: DeviceType, enumName: 'DeviceType' })
  type: DeviceType

  @ApiProperty()
  isControlled: boolean
}
