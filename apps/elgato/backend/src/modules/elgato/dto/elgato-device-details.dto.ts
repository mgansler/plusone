import { ApiProperty } from '@nestjs/swagger'

import { DeviceType } from '../../device/enum/device-type'

export class ElgatoDeviceDetailsDto {
  @ApiProperty()
  productName: string

  @ApiProperty({ enum: DeviceType, enumName: 'DeviceType' })
  deviceType: DeviceType

  @ApiProperty()
  displayName: string
}
