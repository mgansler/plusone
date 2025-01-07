import { ApiProperty } from '@nestjs/swagger'

import { DeviceType } from '../enum/device-type'

export class ElgatoDeviceDetailsResponseDto {
  @ApiProperty()
  productName: string

  @ApiProperty({ enum: DeviceType, enumName: 'DeviceType' })
  deviceType: keyof typeof DeviceType

  @ApiProperty()
  displayName: string
}
