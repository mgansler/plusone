import { ApiProperty } from '@nestjs/swagger'

export class DeviceState {
  @ApiProperty()
  on: boolean

  @ApiProperty({ type: Number, required: false, nullable: true })
  hue?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  saturation?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  brightness?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  temperature?: number | null
}
