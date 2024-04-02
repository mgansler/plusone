import { ApiProperty } from '@nestjs/swagger'

export class DeviceState {
  @ApiProperty()
  on: boolean

  @ApiProperty({ required: false, nullable: true })
  hue?: number

  @ApiProperty({ required: false, nullable: true })
  saturation?: number

  @ApiProperty({ required: false, nullable: true })
  brightness?: number
}
