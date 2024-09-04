import { ApiProperty } from '@nestjs/swagger'

export class ElgatoSettingsResponseDto {
  @ApiProperty()
  powerOnBehavior: number

  @ApiProperty()
  powerOnHue: number

  @ApiProperty()
  powerOnSaturation: number

  @ApiProperty()
  powerOnBrightness: number

  @ApiProperty()
  switchOnDurationMs: number

  @ApiProperty()
  switchOffDurationMs: number

  @ApiProperty()
  colorChangeDurationMs: number
}
