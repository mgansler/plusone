import { ApiProperty } from '@nestjs/swagger'

export class TrailAreaCreateDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  latitude: number

  @ApiProperty()
  longitude: number

  @ApiProperty({ required: false })
  threshold?: number
}
