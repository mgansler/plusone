import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, Length, Max, Min } from 'class-validator'

export class TrailAreaCreateDto {
  @ApiProperty()
  @Length(1)
  name: string

  @ApiProperty({ minimum: -90, maximum: 90 })
  @Min(-90)
  @Max(90)
  latitude: number

  @ApiProperty({ minimum: -180, maximum: 180 })
  @Min(-180)
  @Max(180)
  longitude: number

  @ApiProperty({ minimum: 0, maximum: 1, required: false })
  @IsOptional()
  @Min(0)
  @Max(1)
  threshold?: number
}
