import { ApiProperty } from '@nestjs/swagger'

export class TransitionToColorRequestDto {
  @ApiProperty()
  hue: number

  @ApiProperty()
  saturation: number

  @ApiProperty()
  brightness: number
}
