import { ApiProperty } from '@nestjs/swagger'

export class DeviceState {
  @ApiProperty()
  on: boolean

  @ApiProperty({ required: false })
  hue?: number

  @ApiProperty({ required: false })
  saturation?: number

  @ApiProperty({ required: false })
  brightness?: number
}
