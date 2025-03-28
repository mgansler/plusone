import { ApiProperty } from '@nestjs/swagger'
import { Max, Min } from 'class-validator'

import { TrailAreaBaseDto } from './trail-area-create-base.dto'

export class TrailAreaUpdateDto extends TrailAreaBaseDto {
  @ApiProperty({ minimum: -90, maximum: 90, example: 48.7 })
  @Min(-90)
  @Max(90)
  latitude: number

  @ApiProperty({ minimum: -180, maximum: 180, example: 9.123 })
  @Min(-180)
  @Max(180)
  longitude: number

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.33, required: true })
  @Min(0)
  @Max(1)
  threshold: number
}
