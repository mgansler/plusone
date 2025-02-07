import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, Max, Min } from 'class-validator'

import { TrailAreaBaseDto } from './trail-area-create-base.dto'

export class TrailAreaCreateFromCoordinatesDto extends TrailAreaBaseDto {
  @ApiProperty({ minimum: -90, maximum: 90, example: 48.7 })
  @Min(-90)
  @Max(90)
  latitude: number

  @ApiProperty({ minimum: -180, maximum: 180, example: 9.123 })
  @Min(-180)
  @Max(180)
  longitude: number

  @IsOptional()
  threshold?: number
}
