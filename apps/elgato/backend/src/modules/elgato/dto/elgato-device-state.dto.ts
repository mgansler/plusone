import { ApiProperty } from '@nestjs/swagger'

export class LightStateWithColor {
  @ApiProperty({ minimum: 0, maximum: 0, required: false })
  on: 0 | 1

  @ApiProperty({ minimum: 0, maximum: 100, required: false })
  brightness: number

  @ApiProperty({ minimum: 0, maximum: 360, required: false })
  hue: number | undefined

  @ApiProperty({ minimum: 0, maximum: 100, required: false })
  saturation: number | undefined

  // 143: 7000K; 344: 2900K
  @ApiProperty({ minimum: 143, maximum: 100, required: false })
  temperature: number | undefined
}

export class ElgatoDeviceStateDto {
  @ApiProperty()
  numberOfLights: number

  @ApiProperty({ type: () => [LightStateWithColor] })
  lights: LightStateWithColor[]
}
